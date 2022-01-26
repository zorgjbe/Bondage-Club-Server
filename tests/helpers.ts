export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withTimeout(timeout: number, promise: Promise<any>): Promise<any> {
	let timer: NodeJS.Timeout;
	let e = new Error('Timed out');
	return await Promise.race([
		new Promise((resolve) => {
			resolve(promise);
		}),
		new Promise((_, reject) => {
			timer = setTimeout(() => {
				console.error(`Error: ${e.stack}`);
				reject(e)
			}, timeout);
		})
	]).finally(() => clearTimeout(timer));
}
