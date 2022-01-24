/**
 * @param {number} ms
 */
export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {number} timeout
 * @param {Promise} promise
 */
export async function withTimeout(timeout: number, promise: Promise<unknown>) {
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
