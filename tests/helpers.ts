export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withTimeout(timeout: number, promise: Promise<any>): Promise<any> {
	let timer: NodeJS.Timeout;
	return await Promise.race([
		new Promise((resolve) => {
			resolve(promise);
		}),
		new Promise((_, reject) => {
			timer = setTimeout(() => reject(new Error('Timed out')), timeout);
		})
	]).finally(() => clearTimeout(timer));
}
