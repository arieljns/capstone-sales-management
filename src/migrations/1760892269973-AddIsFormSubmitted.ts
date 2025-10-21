import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsFormSubmitted1760892269973 implements MigrationInterface {
  name = 'AddIsFormSubmitted1760892269973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "validation" ADD "isFormSubmitted" boolean NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "validation" DROP COLUMN "isFormSubmitted"`,
    );
  }
}
