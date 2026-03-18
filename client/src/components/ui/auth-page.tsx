'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import {
	ChevronLeftIcon,
	Grid2x2PlusIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthPageProps {
	children?: React.ReactNode;
	title?: string;
	description?: string;
	topButtonLabel?: string;
	topButtonHref?: string;
}

export function AuthPage({
	children,
	title = "Sign In or Join Now!",
	description = "Access your Campus HMS account.",
	topButtonLabel,
	topButtonHref,
}: AuthPageProps) {
	return (
		<main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
			<div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
				<div className="z-10 flex items-center gap-2">
					
					
				</div>

				<div className="z-10 flex-1 flex items-center justify-center">
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
						className="relative"
					>
						<Image 
							src="/cms.png" 
							alt="Campus HMS Logo" 
							width={300} 
							height={300} 
							className="relative opacity-60 z-0 drop-shadow-2xl"
							priority
						/>
					</motion.div>
				</div>

				<div className="z-10 mt-auto">
					<blockquote className="space-y-4">
						<p className="text-2xl font-light leading-relaxed">
							&ldquo;This platform streamlines campus management, making everything from academics to administration feel effortless.&rdquo;
						</p>
						<footer className="font-mono text-sm font-semibold opacity-70">
							~ Campus HMS Team
						</footer>
					</blockquote>
				</div>
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>
			<div className="relative flex min-h-screen flex-col justify-center p-4 lg:p-12">

				{topButtonLabel && topButtonHref && (
					<div className="absolute top-7 right-7">
						<Button variant="ghost" className="font-bold text-sm" asChild>
							<Link href={topButtonHref}>
								{topButtonLabel}
							</Link>
						</Button>
					</div>
				)}
				<div className="mx-auto w-full max-w-[440px] space-y-8">
					<div className="flex items-center gap-2 lg:hidden">
						<Grid2x2PlusIcon className="size-8 text-primary" />
						<p className="text-2xl font-bold">Campus HMS</p>
					</div>
					<div className="flex flex-col space-y-2">
						<h1 className="font-heading text-4xl font-black tracking-tight">
							{title}
						</h1>
						<p className="text-muted-foreground text-lg">
							{description}
						</p>
					</div>

					<div className="pt-4">
						{children}
					</div>

					<p className="text-muted-foreground mt-8 text-sm text-center">
						By continuing, you agree to our{' '}
						<Link
							href="/terms"
							className="hover:text-primary underline underline-offset-4 font-medium"
						>
							Terms of Service
						</Link>{' '}
						and{' '}
						<Link
							href="/privacy"
							className="hover:text-primary underline underline-offset-4 font-medium"
						>
							Privacy Policy
						</Link>
						.
					</p>
				</div>
			</div>
		</main>
	);
}

function FloatingPaths({ position }: { position: number }) {
	const paths = Array.from({ length: 36 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
			380 - i * 5 * position
		} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
			152 - i * 5 * position
		} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
			684 - i * 5 * position
		} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
		color: `var(--primary)`,
		width: 0.5 + i * 0.03,
	}));

	return (
		<div className="pointer-events-none absolute inset-0">
			<svg
				className="h-full w-full"
				viewBox="0 0 696 316"
				fill="none"
			>
				<title>Background Paths</title>
				{paths.map((path) => (
					<motion.path
						key={path.id}
						d={path.d}
						stroke={path.color}
						strokeWidth={path.width}
						strokeOpacity={0.05 + path.id * 0.015}
						initial={{ pathLength: 0.3, opacity: 0.6 }}
						animate={{
							pathLength: 1,
							opacity: [0.3, 0.6, 0.3],
							pathOffset: [0, 1, 0],
						}}
						transition={{
							duration: 20 + Math.random() * 10,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
					/>
				))}
			</svg>
		</div>
	);
}
