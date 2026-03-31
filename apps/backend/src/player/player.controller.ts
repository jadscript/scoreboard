import { Controller, Get } from '@nestjs/common';

@Controller('players')
export class PlayerController {
  constructor() {}

  @Get('/me')
  getMe() {
    return {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      gender: 'male',
      whatsapp: '+1234567890',
      photoUrl: 'https://example.com/photo.jpg',
    };
  }
}
