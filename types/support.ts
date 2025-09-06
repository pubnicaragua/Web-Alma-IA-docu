import { z } from 'zod';
import { SupportFormSchema } from "@/zod/support";


export type SupportFormSchemaType = z.infer<typeof SupportFormSchema>;