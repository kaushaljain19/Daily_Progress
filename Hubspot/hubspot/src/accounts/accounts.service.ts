import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Account, Address } from './interfaces/account.interface';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { AccountQueryDto } from './dto/account-query.dto';
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

  /**
   * List accounts with pagination and filters
   */
  async findAll(query: AccountQueryDto): Promise<PaginatedResponse<Account>> {
    try {
      const token = await this.authService.getValidAccessToken();
      const { page = 1, limit = 10, created_after, updated_after } = query;

      const hasFilters = created_after || updated_after;
      const response = hasFilters
        ? await this.searchAccounts(token, page, limit, created_after, updated_after)
        : await this.listAccounts(token, page, limit);

      const results = response.results || [];
      const total = response.total || results.length;

      const accounts = results.map((c: any) => this.mapToAccount(c));

      return {
        data: accounts,
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
      this.logger.error('Error fetching accounts', error);
      throw new HttpException(
        error.message || 'Failed to fetch accounts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
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
      this.logger.error(`Error fetching account ${cleanId}`, error);

      if (error.response?.status === 404) {
        throw new HttpException(`Account ${cleanId} not found`, HttpStatus.NOT_FOUND);
      }

      throw new HttpException('Failed to fetch account', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async listAccounts(token: string, page: number, limit: number) {
    const url = `${this.apiBaseUrl}/crm/v3/objects/companies`;
    
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

  private async searchAccounts(
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
        propertyName: 'hs_lastmodifieddate',
        operator: 'GTE',
        value: new Date(updatedAfter).getTime().toString(),
      });
    }

    const url = `${this.apiBaseUrl}/crm/v3/objects/companies/search`;
    
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

  private mapToAccount(hubspotCompany: any): Account {
    const props = hubspotCompany.properties || {};

    // Build address
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
