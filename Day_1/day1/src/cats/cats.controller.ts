import { Controller, Get, Req, Query, Redirect } from '@nestjs/common';
import type { Request } from 'express';
import { HttpException, HttpStatus } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  //   @Get()
  //   findAll(): string {
  //     return 'This action rerurns all cats';
  //   }

  // Lets see how request object can be accessed directly in controller method
  //   @Get()
  //   findAll(@Req() request: Request) {
  //     console.log(request);
  //     return 'This action returns all cats';
  //   }

  // Redirect example
  //   @Get('docs')
  //   @Redirect('https://docs.nestjs.com', 302)
  //   getDocs(@Query('version') version) {
  //     if (version && version === '5') {
  //       return "{ url: 'https://docs.nestjs.com' }";
  //     }
  //   }

// //   Query Parameters example
//   @Get()
//   async findAll(@Query('age') age: number, @Query('breed') breed: string) {
//     return `This action returns all cats filtered by age: ${age} and breed: ${breed}`;
//   }

// Exception filtering example

@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
 

}
