import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ContactDto } from './dto/contact.dto';
import { HubspotContactResponse } from './interfaces/hubspot-contact.interface';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);
  private readonly token: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.token = this.configService.get<string>('HUBSPOT_API_KEY', '');
  }

  async pushContact(contact: ContactDto): Promise<void> {
    if (!this.token) {
      this.logger.error(
        `HUBSPOT_API_KEY is missing. Cannot sync contact ${contact.email}.`,
      );
      throw new Error('HubSpot credentials are not configured');
    }

    const payload = {
      properties: this.compactProperties({
        email: contact.email,
        firstname: contact.firstName,
        lastname: contact.lastName,
        phone: contact.phone,
        company: contact.company,
        jobtitle: contact.jobTitle,
        city: contact.city,
        state: contact.state,
        country: contact.country,
      }),
    };

    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await firstValueFrom(
          this.httpService.post<HubspotContactResponse>(
            '/crm/v3/objects/contacts',
            payload,
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
              },
            },
          ),
        );

        this.logger.log(
          `HubSpot contact synced successfully for ${contact.email} (id: ${response.data.id}).`,
        );
        return;
      } catch (error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;

        if (status === 409) {
          this.logger.warn(
            `HubSpot contact already exists for ${contact.email}.`,
          );
          return;
        }

        if (status === 429 && attempt < maxAttempts) {
          const delayMs = this.getBackoffDelay(attempt);
          this.logger.warn(
            `HubSpot rate limit hit for ${contact.email}. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxAttempts}).`,
          );
          await this.delay(delayMs);
          continue;
        }

        this.logger.error(
          `Failed to push contact ${contact.email}. Status: ${
            status ?? 'unknown'
          }, message: ${axiosError.message}`,
          axiosError.stack,
        );

        throw axiosError;
      }
    }
  }

  private compactProperties(
    properties: Record<string, string | undefined>,
  ): Record<string, string> {
    return Object.fromEntries(
      Object.entries(properties).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    );
  }

  private getBackoffDelay(attempt: number): number {
    const baseDelayMs = 500;
    return baseDelayMs * Math.pow(2, attempt - 1);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
