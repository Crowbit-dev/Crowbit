import { z } from 'zod';

const envSchema = z.object({
	PORT: z.coerce.number().positive().default(3001),
	SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error('\n❌ Invalid environment variables:');
	for (const issue of parsed.error.issues) {
		console.error(`   ${issue.path.join('.')}: ${issue.message}`);
	}
	console.error();
	process.exit(1);
}

export const env = parsed.data;
