import { Controller, Get, Param } from '@nestjs/common';
import { FormBuilderService } from './form-builder.service';

@Controller('/form')
export class FormBuilderController {
  constructor(private readonly formBuilderService: FormBuilderService) {}

  @Get(':id')
  getFormData(@Param('id') id: number) {
    return this.formBuilderService.getFormData(id);
  }
}
