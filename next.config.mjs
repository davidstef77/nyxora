/** @type {import('next').NextConfig} */
const nextConfig = {
		images: {
			remotePatterns: [
				{
					protocol: 'https',
					hostname: 'intelcorp.scene7.com',
					port: '',
					pathname: '/**'
				},
				{
					protocol: 'https',
					hostname: 'www.nvidia.com',
					port: '',
					pathname: '/**'
				}
				,
				{
					protocol: 'https',
					hostname: 'encrypted-tbn1.gstatic.com',
					port: '',
					pathname: '/**'
				}
			]
		},
		turbopack: {
			root: 'D:/it/pcaffiliate'
		}
};

export default nextConfig;
