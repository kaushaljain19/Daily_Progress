import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Contact } from './interfaces/contact.interface';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { ApiError } from '../common/interfaces/api-error.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
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

  
  async findAll(query: PaginationDto): Promise<PaginatedResponse<Contact>> {
    try {
      const token = await this.authService.getValidAccessToken();
      const { limit = 10, after, created_after, updated_after } = query;

      
      const response = await this.searchContacts(token, limit, after, created_after, updated_after);

      const results = response.results || [];
      const total = response.total || 0;
      const paging = response.paging || {};

      const errors: ApiError[] = [];

      // Map contacts and collect association errors
      const contacts = await Promise.all(
        results.map(async (c: any) => await this.mapToContact(c, token, errors)),
      );

      const contactResponse: PaginatedResponse<Contact> = {
        data: contacts,
        metadata: {
          total: total,
          limit: limit,
          hasMore: !!paging?.next?.after,
          after: paging?.next?.after,
        },
      };

      // Include errors in response if any occurred
      if (errors.length > 0) {
        contactResponse.errors = errors;
        this.logger.warn(`${errors.length} association errors occurred while fetching contacts`);
      }

      return contactResponse;
    } catch (error: any) {
      this.logger.error('Error fetching contacts', error.stack);
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch contacts',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get single contact by ID with associations
   */
  async findOne(id: string): Promise<Contact> {
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

      const errors: ApiError[] = [];
      const contact = await this.mapToContact(response.data, token, errors);
      
      if (errors.length > 0) {
        this.logger.warn(`Errors fetching associations for contact ${cleanId}`, errors);
      }
      
      return contact;
    } catch (error: any) {
      this.logger.error(`Error fetching contact ${cleanId}`, error.stack);

      if (error.response?.status === 404) {
        throw new HttpException(`Contact ${cleanId} not found`, HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch contact',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  
  private async searchContacts(
    token: string,
    limit: number,
    after?: string,
    createdAfter?: string,
    updatedAfter?: string,
  ) {
    const filters: any[] = [];

    // Add date filters if provided
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
    
    const requestBody: any = {
      properties: this.properties.split(','),
      limit,
      sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }],
    };

    // Only add filterGroups if filters exist
    if (filters.length > 0) {
      requestBody.filterGroups = [{ filters }];
    }

    // Add cursor for pagination
    if (after) {
      requestBody.after = after;
    }

    const response = await firstValueFrom(
      this.httpService.post(url, requestBody, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );

    return response.data;
  }

  /**
   * Map HubSpot contact to standardized Contact interface
   */
  private async mapToContact(hubspotContact: any, token: string, errors: ApiError[]): Promise<Contact> {
    const props = hubspotContact.properties || {};

    // Fetch associations with error tracking
    const dealsResult = await this.getAssociations(hubspotContact.id, 'deals', token);
    const accountsResult = await this.getAssociations(hubspotContact.id, 'companies', token);

    // Collect errors
    if (dealsResult.error) {
      errors.push(dealsResult.error);
    }

    if (accountsResult.error) {
      errors.push(accountsResult.error);
    }

    return {
      id: safeString(hubspotContact.id),
      first_name: safeString(props.firstname),
      last_name: safeString(props.lastname),
      company_name: safeString(props.company),
      emails: safeArray(props.email),
      phone_numbers: safeArray(props.phone),
      deal_ids: dealsResult.data,
      account_ids: accountsResult.data,
      created_at: toISODate(props.createdate),
      updated_at: toISODate(props.lastmodifieddate),
    };
  }

  
  private async getAssociations(
    contactId: string,
    type: string,
    token: string,
  ): Promise<{ data: string[]; error?: ApiError }> {
    const url = `${this.apiBaseUrl}/crm/v4/objects/contacts/${contactId}/associations/${type}`;
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      const associations = response.data.results?.map((item: any) => String(item.toObjectId)) || [];
      return { data: associations };
    } catch (error: any) {
      // Create detailed error object for tracking
      const apiError: ApiError = {
        requestUrl: url,
        resourceId: contactId,
        associationType: type,
        timestamp: new Date().toISOString(),
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.response?.data?.message || error.message || 'Unknown error',
        },
      };

      this.logger.warn(
        `Failed to fetch ${type} associations for contact ${contactId}: ${apiError.response.message}`,
      );

      // Return empty data with error details
      return { data: [], error: apiError };
    }
  }
}
