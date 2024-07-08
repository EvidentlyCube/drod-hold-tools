import { ReactElement } from 'react';
import TempImage from '../assets/images/TempImage.png';
import FullPageMessage from "../components/common/FullPageMessage";

export default function RouteHome() {
	return <div className="container mt-5 homepage-cards">
		<section className="hero is-primary mb-5">
			<div className="hero-body">
				<p className="title">Get started quickly?</p>
				<p className="subtitle">Just click "Load Hold" in the top-right corner. The rest is, hopefully, mostly self explanatory.</p>
			</div>
		</section>
		<div className="columns">
			<div className="column">
				<Card icon="fa-comments" title="Edit Speech" subtitle="And other texts">
					<p>
						Speech, room names, data names, and more. All the text
						can be edited.
					</p>
				</Card>
			</div>
			<div className="column">
				<Card icon="fa-database" title="Edit Images & Audio" subtitle="Preview and replace">
					<p>
						Audio and image files can be easily updated in place
						without having to worry about scripts breaking.
					</p>
				</Card>
			</div>
			<div className="column">
				<Card icon="fa-file-shield" title="Auto Backups" subtitle="Added holds & changes">
					<p>
						All the changes you make are automatically stored
						in your browser's storage so that you don't accidentally
						lose your changes.
					</p>
					<p>
						Just... Don't trust it blindly!
					</p>
				</Card>
			</div>
		</div>
		<div className="columns">
			<div className="column">
				<Card icon="fa-brands fa-github" title="Open Source" subtitle="See it on github">
					<p>
						If you somehow feel inclined to check the codebase
						you can find it <a href="https://github.com/EvidentlyCube/drod-hold-tools">here</a>.
					</p>
				</Card>
			</div>
			<div className="column">
				<Card icon="fa-industry" title="100% Locally Sourced" subtitle="0% Enterprise">
					<p>
						I know it looks like a generic webapp/webtool/webpage made
						for profit or something. I am not good with web design, okay?
					</p>
				</Card>
			</div>
			<div className="column">
				<Card icon="fa-newspaper" title="Roadmap" subtitle="And changlog">
					<p>
						Below you can find the list of planned things, changelog and stuff.
					</p>
				</Card>
			</div>
		</div>
		<div className="columns">
			<div className="column">
				<div className="card">
					<div className="card-content">
						<div className="content">
							<h3>Roadmap</h3>
							<h5 className="is-muted">a.k.a planned features</h5>
							<ul>
								<li>Character list and renaming them</li>
								<li>Variable list and renaming them</li>
								<li>&hellip;with optional auto-changing it in all scripts</li>
								<li>Editing entrance texts</li>
								<li>Editing world map names</li>
								<li>Editing scroll texts</li>
								<li>Adding and removing data</li>
								<li>Changing data attached to Speech</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<div className="column">
				<div className="card">
					<div className="card-content">
						<div className="content">
							<h3>Changelog</h3>
							<h5 className="subtitle is-6">v0.1.0</h5>
							<ul>
								<li>Currently released version</li>
								<li>Import & Export</li>
								<li>Backup hold & changes in browser storage</li>
								<li>Edit speeches and level names and data names</li>
								<li>Replace data files</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>;
}

interface CardProps {
	icon: string;
	title: string;
	subtitle: string;
	children: ReactElement[] | ReactElement
}
function Card({ icon, title, subtitle, children }: CardProps) {
	return <div className="card">
		<div className="card-content">
			<div className="media">
				<div className="media-left">
					<div className="icon is-large">
						<i className={`fas fa-2x ${icon}`} />
					</div>
				</div>
				<div className="media-content">
					<p className="title is-4">{title}</p>
					<p className="subtitle is-6">{subtitle}</p>
				</div>
			</div>

			<div className="content">
				{children}
			</div>
		</div>
	</div>;
}