import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Account, Address } from './interfaces/account.interface';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthService } from '../auth/auth.service';
import { safeString, safeArray, toISODate } from '../common/utils/helpers.utils';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
  private readonly apiBaseUrl: string;
  private readonly properties = 'name,domain,industry,annualrevenue,phone,city,state,zip,country,address,description,hubspot_owner_id,createdate,hs_lastmodifieddate';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.apiBaseUrl = this.configService.get<string>('hubspot.apiBaseUrl') || 'https://api.hubapi.com';
  }

  
   // List accounts with cursor-based pagination and filters
   
  async findAll(query: PaginationDto): Promise<PaginatedResponse<Account>> {
    try {
      const token = await this.authService.getValidAccessToken();
      const { limit = 10, after, created_after, updated_after } = query;

    
      const response = await this.searchAccounts(token, limit, after, created_after, updated_after);

      const results = response.results || [];
      const total = response.total || 0;
      const paging = response.paging || {};

      const accounts = results.map((c: any) => this.mapToAccount(c));

      return {
        data: accounts,
        metadata: {
          total: total,
          limit: limit,
          hasMore: !!paging?.next?.after,
          after: paging?.next?.after,
        },
      };
    } catch (error: any) {
      this.logger.error('Error fetching accounts', error.stack);
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch accounts',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get single account by ID
   */
  async findOne(id: string): Promise<Account> {
    const cleanId = id.replace(/[^0-9]/g, '');
    
    if (!cleanId) {
      throw new HttpException('Invalid account ID format', HttpStatus.BAD_REQUEST);
    }

    try {
      const token = await this.authService.getValidAccessToken();
      const url = `${this.apiBaseUrl}/crm/v3/objects/companies/${cleanId}`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          params: { properties: this.properties },
        }),
      );

      return this.mapToAccount(response.data);
    } catch (error: any) {
      this.logger.error(`Error fetching account ${cleanId}`, error.stack);

      if (error.response?.status === 404) {
        throw new HttpException(`Account ${cleanId} not found`, HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch account',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  
  private async searchAccounts(
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
        propertyName: 'hs_lastmodifieddate',
        operator: 'GTE',
        value: new Date(updatedAfter).getTime().toString(),
      });
    }

    const url = `${this.apiBaseUrl}/crm/v3/objects/companies/search`;
    
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

  private mapToAccount(hubspotCompany: any): Account {
    const props = hubspotCompany.properties || {};

    const address: Address = {
      street: safeString(props.address),
      city: safeString(props.city),
      state: safeString(props.state),
      zip_code: safeString(props.zip),
      country: safeString(props.country),
      location_type: 'primary',
    };

    const hasAddress = address.street || address.city || address.state || address.zip_code || address.country;

    return {
      id: safeString(hubspotCompany.id),
      owner_id: safeString(props.hubspot_owner_id),
      name: safeString(props.name),
      description: safeString(props.description),
      industries: safeArray(props.industry),
      annual_revenue: safeString(props.annualrevenue),
      website: safeString(props.domain),
      addresses: hasAddress ? [address] : [],
      phone_numbers: safeArray(props.phone),
      created_at: toISODate(props.createdate),
      updated_at: toISODate(props.hs_lastmodifieddate),
    };
  }
}
