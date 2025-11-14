import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Account } from './interfaces/account.interface';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { AccountQueryDto } from './dto/account-query.dto';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
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

  async findAll(query: AccountQueryDto): Promise<PaginatedResponse<Account>> {
    try {
      const { page = 1, limit = 10, created_after, updated_after } = query;
      
      const url = `${this.apiBaseUrl}/crm/v3/objects/companies`;
      
      const params: any = {
        limit,
        properties: [
          'name',
          'domain',
          'industry',
          'annualrevenue',
          'phone',
          'city',
          'state',
          'zip',
          'country',
          'address',
          'description',
          'hubspot_owner_id',
          'createdate',
          'hs_lastmodifieddate',
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
          propertyName: 'hs_lastmodifieddate',
          operator: 'gte',
          value: new Date(updated_after).getTime().toString(),
        });
      }

      let hubspotCompanies;
      
      if (filters.length > 0) {
        const searchUrl = `${this.apiBaseUrl}/crm/v3/objects/companies/search`;
        const searchPayload = {
          filterGroups: [{ filters }],
          properties: params.properties.split(','),
          limit,
          after: page > 1 ? ((page - 1) * limit).toString() : undefined,
        };
        
        hubspotCompanies = await firstValueFrom(
          this.httpService.post(searchUrl, searchPayload, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          }),
        );
      } else {
        if (page > 1) {
          params.after = ((page - 1) * limit).toString();
        }
        
        hubspotCompanies = await firstValueFrom(
          this.httpService.get(url, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
            params,
          }),
        );
      }

      const results = hubspotCompanies.data.results || [];
      const total = hubspotCompanies.data.total || results.length;
      
      const accounts: Account[] = results.map((company: any) => 
        this.mapToAccount(company),
      );

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
      this.logger.error('Error fetching accounts from HubSpot', error.stack);
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch accounts',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<Account> {
    try {
      const url = `${this.apiBaseUrl}/crm/v3/objects/companies/${id}`;
      
      const params = {
        properties: [
          'name',
          'domain',
          'industry',
          'annualrevenue',
          'phone',
          'city',
          'state',
          'zip',
          'country',
          'address',
          'description',
          'hubspot_owner_id',
          'createdate',
          'hs_lastmodifieddate',
        ].join(','),
      };

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          params,
        }),
      );

      return this.mapToAccount(response.data);
    } catch (error: any) {
      this.logger.error(`Error fetching account ${id}`, error.stack);
      
      if (error.response?.status === 404) {
        throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch account',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private mapToAccount(hubspotCompany: any): Account {
    const props = hubspotCompany.properties || {};
    
    const address = {
      street: props.address || '',
      city: props.city || '',
      state: props.state || '',
      zip_code: props.zip || '',
      country: props.country || '',
      location_type: 'primary',
    };

    return {
      id: hubspotCompany.id || '',
      owner_id: props.hubspot_owner_id || '',
      name: props.name || '',
      description: props.description || '',
      industries: props.industry ? [props.industry] : [],
      annual_revenue: props.annualrevenue || '',
      website: props.domain || '',
      addresses: address.street || address.city ? [address] : [],
      phone_numbers: props.phone ? [props.phone] : [],
      created_at: props.createdate ? new Date(props.createdate).toISOString() : '',
      updated_at: props.hs_lastmodifieddate ? new Date(props.hs_lastmodifieddate).toISOString() : '',
    };
  }
}
