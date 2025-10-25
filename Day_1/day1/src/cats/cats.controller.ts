import { Controller, Get, Req, Query, Redirect,Post,HttpCode,Header,Param } from '@nestjs/common';
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

// @Get()
// async findAll() {
//   throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
// }

@Get()
find()
{ 
  return "hello"; 
}


// @Get('abcd/*path') // according new express version wildcard should be defined as *path
// findAll() {
//   return 'This route uses a wildcard';
// }

// @Post()
// @HttpCode(204) // 204 - No Content
// create( ) {
//   return "custom exception code checking"
// }


// @Post()
// @HttpCode(204)
// @Header('Cache-Control', 'no stroe')
// create()
// { 
//   return "check header decorator"
// }

//  @Get(':id')
//   findOne(@Param() params: any): string {
//     console.log(params.id);
//     return `This action returns a #${params.id} cat`;
//   }


//  @Get(':id')
//   findOne(@Param('id') id: string): string {
//     return `This action returns a #${id} cat`;
//   }

}
