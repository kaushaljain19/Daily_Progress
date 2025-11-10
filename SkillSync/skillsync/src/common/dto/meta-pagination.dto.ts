import { ApiProperty } from '@nestjs/swagger';
import { PaginationQueryDto } from './pagination-query.dto';

class PaginationMeta {
  @ApiProperty({ description: 'The current page number' })
  readonly currentPage: number;

  @ApiProperty({ description: 'Number of items returned in this page' })
  readonly itemCount: number;

  @ApiProperty({ description: 'Number of items requested per page' })
  readonly itemsPerPage: number;

  @ApiProperty({ description: 'Total number of items available' })
  readonly totalItems: number;

  @ApiProperty({ description: 'Total number of pages available' })
  readonly totalPages: number;

  constructor({ itemCount, totalItems, pageOptionsDto }: {
    itemCount: number;
    totalItems: number;
    pageOptionsDto: PaginationQueryDto;
  }) {
    this.currentPage = pageOptionsDto.page;
    this.itemsPerPage = pageOptionsDto.limit;
    this.itemCount = itemCount;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  }
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PaginationMeta })
  readonly meta: PaginationMeta;

  constructor(data: T[], totalItems: number, pageOptionsDto: PaginationQueryDto) {
    this.data = data;
    
    this.meta = new PaginationMeta({
      itemCount: data.length, 
      totalItems,
      pageOptionsDto,
    });
    
  }
}
