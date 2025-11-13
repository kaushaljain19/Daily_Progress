import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Contact } from './interfaces/contact.interface';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { ContactQueryDto } from './dto/contact-query.dto';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  private readonly accessToken: string;
  private readonly apiBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Fix: Add default values
    this.accessToken = this.configService.get<string>('hubspot.accessToken') || '';
    this.apiBaseUrl = this.configService.get<string>('hubspot.apiBaseUrl') || 'https://api.hubapi.com';
  }

  async findAll(query: ContactQueryDto): Promise<PaginatedResponse<Contact>> {
    try {
      const { page = 1, limit = 10, created_after, updated_after } = query;
      
      const url = `${this.apiBaseUrl}/crm/v3/objects/contacts`;
      
      const params: any = {
        limit,
        properties: [
          'firstname',
          'lastname',
          'company',
          'email',
          'phone',
          'createdate',
          'lastmodifieddate',
        ].join(','),
      };

      
      const filters: Array<{
        propertyName: string;
        operator: string;
        value: string;
      }> = [];
      
      if (created_after) {
        filters.push({
          propertyName: 'createdate',
          operator: 'gte',
          value: new Date(created_after).getTime().toString(),
        });
      }
      
      if (updated_after) {
        filters.push({
          propertyName: 'lastmodifieddate',
          operator: 'gte',
          value: new Date(updated_after).getTime().toString(),
        });
      }

      let hubspotContacts;
      
      if (filters.length > 0) {
        const searchUrl = `${this.apiBaseUrl}/crm/v3/objects/contacts/search`;
        const searchPayload = {
          filterGroups: [{ filters }],
          properties: params.properties.split(','),
          limit,
          after: page > 1 ? ((page - 1) * limit).toString() : undefined,
        };
        
        hubspotContacts = await firstValueFrom(
          this.httpService.post(searchUrl, searchPayload, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          }),
        );
      } else {
        if (page > 1) {
          params.after = ((page - 1) * limit).toString();
        }
        
        hubspotContacts = await firstValueFrom(
          this.httpService.get(url, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
            params,
          }),
        );
      }

      const results = hubspotContacts.data.results || [];
      const total = hubspotContacts.data.total || results.length;
      
      const contacts: Contact[] = await Promise.all(
        results.map(async (contact: any) => await this.mapToContact(contact)),
      );

      return {
        data: contacts,
        metadata: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrevious: page > 1,
        },
      };
    } catch (error: any) {
      this.logger.error('Error fetching contacts from HubSpot', error.stack);
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch contacts',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<Contact> {
    try {
      const url = `${this.apiBaseUrl}/crm/v3/objects/contacts/${id}`;
      
      const params = {
        properties: [
          'firstname',
          'lastname',
          'company',
          'email',
          'phone',
          'createdate',
          'lastmodifieddate',
        ].join(','),
      };

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          params,
        }),
      );

      return await this.mapToContact(response.data);
    } catch (error: any) {
      this.logger.error(`Error fetching contact ${id}`, error.stack);
      
      if (error.response?.status === 404) {
        throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch contact',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async mapToContact(hubspotContact: any): Promise<Contact> {
    const props = hubspotContact.properties || {};
    
    const dealIds = await this.getAssociations(hubspotContact.id, 'deals');
    const accountIds = await this.getAssociations(hubspotContact.id, 'companies');

    return {
      id: hubspotContact.id || '',
      first_name: props.firstname || '',
      last_name: props.lastname || '',
      company_name: props.company || '',
      emails: props.email ? [props.email] : [],
      phone_numbers: props.phone ? [props.phone] : [],
      deal_ids: dealIds,
      account_ids: accountIds,
      // Fix: Use empty string instead of null
      created_at: props.createdate ? new Date(props.createdate).toISOString() : '',
      updated_at: props.lastmodifieddate ? new Date(props.lastmodifieddate).toISOString() : '',
    };
  }

  private async getAssociations(contactId: string, toObjectType: string): Promise<string[]> {
    try {
      const url = `${this.apiBaseUrl}/crm/v4/objects/contacts/${contactId}/associations/${toObjectType}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }),
      );

      return response.data.results?.map((item: any) => item.toObjectId) || [];
    } catch (error: any) {
      this.logger.warn(`Failed to fetch ${toObjectType} associations for contact ${contactId}`);
      return [];
    }
  }
}













