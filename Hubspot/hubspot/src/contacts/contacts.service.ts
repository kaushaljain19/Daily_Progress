import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Contact } from './interfaces/contact.interface';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { ContactQueryDto } from './dto/contact-query.dto';
import { AuthService } from '../auth/auth.service';
import { safeString, safeArray, toISODate } from '../common/utils/helpers.utils';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  private readonly apiBaseUrl: string;
  private readonly properties = 'firstname,lastname,company,email,phone,createdate,lastmodifieddate';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('hubspot.apiBaseUrl') || 'https://api.hubapi.com';
  }

  /**
   * List contacts with pagination and filters
   */
  async findAll(query: ContactQueryDto): Promise<PaginatedResponse<Contact>> {
    try {
      const token = await this.authService.getValidAccessToken();
      const { page = 1, limit = 10, created_after, updated_after } = query;

      // Use search API if filters exist
      const hasFilters = created_after || updated_after;
      const response = hasFilters
        ? await this.searchContacts(token, page, limit, created_after, updated_after)
        : await this.listContacts(token, page, limit);

      const results = response.results || [];
      const total = response.total || results.length;

      // Map to Contact interface
      const contacts = await Promise.all(
        results.map((c: any) => this.mapToContact(c, token)),
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
      this.logger.error('Error fetching contacts', error);
      throw new HttpException(
        error.message || 'Failed to fetch contacts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get single contact by ID
   */
  async findOne(id: string): Promise<Contact> {
    // Sanitize ID - only numbers allowed
    const cleanId = id.replace(/[^0-9]/g, '');
    
    if (!cleanId) {
      throw new HttpException('Invalid contact ID format', HttpStatus.BAD_REQUEST);
    }

    try {
      const token = await this.authService.getValidAccessToken();
      const url = `${this.apiBaseUrl}/crm/v3/objects/contacts/${cleanId}`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          params: { properties: this.properties },
        }),
      );

      return await this.mapToContact(response.data, token);
    } catch (error: any) {
      this.logger.error(`Error fetching contact ${cleanId}`, error);

      if (error.response?.status === 404) {
        throw new HttpException(`Contact ${cleanId} not found`, HttpStatus.NOT_FOUND);
      }

      throw new HttpException('Failed to fetch contact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * List contacts - simple pagination
   */
  private async listContacts(token: string, page: number, limit: number) {
    const url = `${this.apiBaseUrl}/crm/v3/objects/contacts`;
    
    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit,
          properties: this.properties,
          after: page > 1 ? ((page - 1) * limit).toString() : undefined,
        },
      }),
    );

    return response.data;
  }

  /**
   * Search contacts with date filters
   */
  private async searchContacts(
    token: string,
    page: number,
    limit: number,
    createdAfter?: string,
    updatedAfter?: string,
  ) {
   const filters: { propertyName: string; operator: string; value: string }[] = [];

    if (createdAfter) {
      filters.push({
        propertyName: 'createdate',
        operator: 'GTE',
        value: new Date(createdAfter).getTime().toString(),
      });
    }

    if (updatedAfter) {
      filters.push({
        propertyName: 'lastmodifieddate',
        operator: 'GTE',
        value: new Date(updatedAfter).getTime().toString(),
      });
    }

    const url = `${this.apiBaseUrl}/crm/v3/objects/contacts/search`;
    
    const response = await firstValueFrom(
      this.httpService.post(
        url,
        {
          filterGroups: filters.length > 0 ? [{ filters }] : undefined,
          properties: this.properties.split(','),
          limit,
          after: page > 1 ? ((page - 1) * limit).toString() : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );

    return response.data;
  }

  /**
   * Map HubSpot contact to Contact interface
   */
  private async mapToContact(hubspotContact: any, token: string): Promise<Contact> {
    const props = hubspotContact.properties || {};

    // Fetch associations
    const dealIds = await this.getAssociations(hubspotContact.id, 'deals', token);
    const accountIds = await this.getAssociations(hubspotContact.id, 'companies', token);

    return {
      id: safeString(hubspotContact.id),
      first_name: safeString(props.firstname),
      last_name: safeString(props.lastname),
      company_name: safeString(props.company),
      emails: safeArray(props.email),
      phone_numbers: safeArray(props.phone),
      deal_ids: dealIds,
      account_ids: accountIds,
      created_at: toISODate(props.createdate),
      updated_at: toISODate(props.lastmodifieddate),
    };
  }

  /**
   * Get contact associations (deals, companies)
   */
  private async getAssociations(contactId: string, type: string, token: string): Promise<string[]> {
    try {
      const url = `${this.apiBaseUrl}/crm/v4/objects/contacts/${contactId}/associations/${type}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      return response.data.results?.map((item: any) => String(item.toObjectId)) || [];
    } catch {
      return [];
    }
  }
}
