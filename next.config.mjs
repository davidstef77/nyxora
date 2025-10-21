/** @type {import('next').NextConfig} */
const nextConfig = {
	// Performance optimizations
	compress: true,
	poweredByHeader: false,
	
	// Experimental features for performance
	experimental: {
		optimizeCss: true,
		optimizePackageImports: ['next-auth'],
	},
	
	// Turbopack configuration (moved from experimental)
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js',
			},
		},
	},

	// Image optimization
	images: {
		formats: ['image/webp', 'image/avif'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 31536000, // 1 year
		dangerouslyAllowSVG: true,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
			},
			{
				protocol: 'https',
				hostname: 'encrypted-tbn1.gstatic.com',
				port: '',
				pathname: '/**'
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: '',
				pathname: '/**'
			}
		]
	},

	// Webpack optimizations
	webpack: (config, { dev, isServer }) => {
		// Production optimizations
		if (!dev) {
			config.optimization = {
				...config.optimization,
				splitChunks: {
					chunks: 'all',
					cacheGroups: {
						vendor: {
							test: /[\\/]node_modules[\\/]/,
							name: 'vendors',
							chunks: 'all',
							priority: 10,
						},
						common: {
							name: 'common',
							minChunks: 2,
							chunks: 'all',
							priority: 5,
						},
					},
				},
			};
		}

		// Reduce bundle size
		config.resolve.alias = {
			...config.resolve.alias,
		};

		return config;
	},

	// Headers for performance
	async headers() {
		return [
			{
				source: '/_next/static/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
			{
				source: '/images/(.*)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, immutable',
					},
				],
			},
		];
	},

	turbopack: {
		root: 'D:/it/pcaffiliate'
	}
};

export default nextConfig;
