import { ContactUsSchema } from '@/app/zod/contact'
import { z } from 'zod'

export type ContactUsSchemaType = z.infer<typeof ContactUsSchema>

export type ContactResponse = {
    message: string
}