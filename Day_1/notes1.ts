Introduction - 

1. Nest is built on top of express and optionally can use fastify 
2. In nest you can also directly use the express methdods 

********************Overview ***********************

----------------------------First steps ------------------------------

1. main.ts	- The entry file of the application which uses the core function
NestFactory to create a Nest application instance.

2. To create a Nest application instance, we use the core NestFactory class. 
NestFactory exposes a few static methods that allow creating an application 
instance. The create() method returns an application object, which fulfills 
the INestApplication interface. This object provides a set of methods which 
are described in the coming chapters. In the main.ts example above, we simply 
start up our HTTP listener, which lets the application await inbound HTTP requests.

const app = await NestFactory.create(AppModule);
app will going to have all the methods because app is object of INestApplication interface.
mehods like listen(), get(), post(), setGlobalPrefix() etc are some of the methods.


------------------------------Controllers --------------------------------

1.Controllers are responsible for handling incoming requests and 
sending responses back to the client.


2.if we return -> object/array from controller method -> nest will  
converted to json automatically

3. get - 200 staturs code by default / post - 201 status code by default/ 
if we want to change the status code we can use @HttpCode() 
decorator at controller method level.

Import HttpCode from the @nestjs/common package.

@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}


4. we can acess response object directly by using @Res() decorator

5. if we use @Res() decorator then we have to send the response by ourself 
 using response object methods like res.send(), res.json() etc.
 nest will not handle the response automatically for that particular route

6. To use both approaches at the same time (for example, 
 by injecting the response object to only set 
 cookies/headers but still leave the rest to the framework), 
 you must set the passthrough option to true in the 
 @Res({ passthrough: true }) decorator.


7. Request Object - 
Handlers often need access to the client’s request details. 
Nest provides access to the request object from the underlying 
platform (Express by default). You can access the request object 
by instructing Nest to inject it using the @Req() decorator in 
the handler’s signature.


8. 
@Get('abcd/*')
findAll() {
  return 'This route uses a wildcard';
}
The 'abcd/*' route path will match abcd/, abcd/123, abcd/abc, and so on.

9. @Redirect() takes two arguments, url and statusCode, 
both are optional. The default value of statusCode is 302 
(Found) if omitted.


@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' };
  }
}


10. Sub-domain routing - Like sageHr 

    
@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return account;
  }
}

11. State Sharing - nearly everything is shared across 
 incoming requests. This includes resources like the database 
 connection pool, singleton services with global state, and more.
 It's important to understand that Node.js doesn't use the 
 request/response Multi-Threaded Stateless Model, where each 
 request is handled by a separate thread. As a result, using 
 singleton instances in Nest is completely safe for our applications.


 12.A DTO is an object that specifies how data should be sent over 
 the network. We could define the DTO schema using TypeScript 
 interfaces or simple classes. However, we recommend using classes here

 Pipes rely on having access to the metatype of variables at runtime, 
 which is only possible with classes.

 13. If your application requires handling more complex 
 query parameters, such as nested objects or arrays:


?filter[where][name]=John&filter[where][age]=30
?item[]=1&item[]=2
you'll need to configure your HTTP adapter (Express or Fastify) to 
use an appropriate query parser. In Express, you can use the 
extended parser, which allows for rich query objects:


13.So far, we've covered the standard Nest way of manipulating responses. 
 Another approach is to use a library-specific response object. To inject 
 a specific response object, we can use the @Res() decorator. To highlight 
 the differences, let’s rewrite the CatsController like this:

 
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res: Response) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  findAll(@Res() res: Response) {
     res.status(HttpStatus.OK).json([]);
  }
}



******************** Provider*******************


Providers are a fundamental concept in NestJS. 
Many essential Nest classes such as services
repositories, factories, and helpers can be 
treated as providers.

**************** Module **********************


1. A module is a class annotated with a @Module() decorator.
The @Module() decorator provides metadata that Nest 
uses to organize the application structure.

2. Every Nest application has at least one module, the root module, 
which serves as the starting point for Nest to build the application graph.

3. Feature modules related components group karte hain, 
   SOLID principles follow karte hain

4. @Global() decorator modules ko everywhere available 
   banata hai (sirf once register)

   ****************** Middleware **********************



1.Middleware functions are functions that have access to the request
and response objects, and the next middleware function in the 
application’s request-response cycle.


5.Middleware functions can perform the following tasks:
execute any code.
make changes to the request and the response objects.
end the request-response cycle.
call the next middleware function in the stack.
if the current middleware function does not end the request-response cycle, 
it must call next() to pass control to the next middleware function. 
Otherwise, the request will be left hanging.


************* Exception Filters **********************

Nest comes with a built-in exceptions layer which is 
responsible for processing all unhandled exceptions 
across an application. When an exception is not handled 
by your application code, it is caught 
by this layer, which then automatically 
sends an appropriate user-friendly response.


Custom exceptions - 
you will not need to write custom exceptions, and can 
use the built-in Nest HTTP exception, as described in the 
next section. If you do need to create customized exceptions, 
it's good practice to create your own exceptions hierarchy, 
where your custom exceptions inherit from the base HttpException 
class. With this approach, Nest will recognize your exceptions, 
and automatically take care 
of the error responses. Let's implement such a custom exception:


Let's create an exception filter that is responsible for 
catching exceptions which are an instance of the HttpException 
class, and implementing custom response logic for them. To do 
this, we'll need to access the underlying platform Request 
and Response objects. We'll access the Request object so we 
can pull out the original url and include that in the logging 
information. We'll use the Response object to take direct control of 
the response that is sent, using the response.json() method.

