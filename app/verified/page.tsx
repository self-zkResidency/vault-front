import Image from "next/image";
import styles from "./page.module.css";
import skeleton from "./skeleton.gif";

export default function HomePage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-hidden">
			<div className="text-center mb-10">
				<h1 className={styles.rotatingTitle}>Identity Verified!</h1>
			</div>

			<div className="text-center">
				<Image
					src={skeleton} // Place your GIF in the public folder
					alt="Loading animation"
					width={200}
					height={200}
					priority
				/>
				<p className="text-gray-500 text-sm">You are now verified to access this application.</p>
				<div className="flex flex-col items-center gap-2 mt-2">
					<h3 className="text-gray-800 text-lg font-bold">Here you are going to be able to:</h3>
					<ul className="list-disc list-inside text-gray-600 text-sm">
						<li>Make a deposit</li>
						<li>Withdraw money</li>
						<li>Transfer money</li>
						<li>View your transaction history</li>
						<li>View your account balance</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
