import { z } from 'zod';
import { AlertAddBinnacleSchema } from '@/zod/alerts';

export type AlertAddBinnacleSchemaType = z.infer<typeof AlertAddBinnacleSchema>;

