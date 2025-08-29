import { z } from 'zod';

export const ContactUsSchema = z.object({
    name: z.string().nonempty(),
    email: z.string().nonempty(),
    phone: z.string().nonempty(),
    captcha: z.boolean(),
});