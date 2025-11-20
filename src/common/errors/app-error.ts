class AppError extends Error{
  constructor(
    public readonly message: string,
    public readonly statusCode:number,
    public readonly code= 'INTERNAL_ERROR'|| 'APP_ERROR',
    public readonly metaData:string
  )
  super(message)
}