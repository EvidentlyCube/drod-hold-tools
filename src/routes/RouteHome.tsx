import { ReactElement } from 'react';

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
								<li>Variable list and renaming them</li>
								<li>&hellip;with optional auto-changing it in all scripts</li>
								<li>Adding and removing data</li>
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
							<h5 className="subtitle is-6">v0.1.3{" "}<span className="is-muted">(????-??-??)</span></h5>
							<ul>
								<li><Feat/>Added page for viewing variables</li>
								<li><Bug/>Tables were not displaying every 25th element</li>
								<li><Bug/>Exported hold did not change Last Updated date which made it impossible
								to import the hold without deleting it first</li>
								<li><Bug/>Players with name changes should now correctly update after importing to DROD</li>
							</ul>
							<h5 className="subtitle is-6">v0.1.2{" "}<span className="is-muted">(2024-08-29)</span></h5>
							<ul>
								<li><Feat/>Players list &rarr; Added</li>
								<li><Feat/>Levels list &rarr; Edit author + Edit created</li>
								<li><Feat/>World Map list &rarr; Edit data</li>
								<li><Feat/>Improved how references are displayed</li>
								<li><Bug/>Data <strong>uses</strong> update when used data is changed anywhere</li>
							</ul>
							<h5 className="subtitle is-6">v0.1.1{" "}<span className="is-muted">(2024-07-12)</span></h5>
							<ul>
								<li><Feat/> Characters list + edit name</li>
								<li><Feat/> Entrances list + edit description/show description</li>
								<li><Feat/> Scrolls list + edit message</li>
								<li><Feat/> Change list sorting + better location displaying</li>
								<li><Feat/> Added a step after importing that validates the hold exports correctly</li>
								<li><Feat/> Added version validation at the start</li>
								<li><Feat/> Speeches list &rarr; Edit Mood</li>
								<li><Feat/> Speeches list &rarr; Edit Data</li>
								<li><Feat/> Entrances list &rarr; Edit Data</li>
								<li><Feat/> World Maps list + Edit name</li>
								<li><Feat/> Characters list &rarr; Edit avatar & tile data IDs</li>
								<li><Bug/> Table state and config is no longer shared between holds</li>
								<li><Bug/> Hiding columns no longer break the table if it has any filters</li>
								<li><Bug/> Fixed a bunch of small differences between DROD-created hold data and the data created by the tool</li>
								<li><Bug/> Fixed saved games and demos not being lost during export.</li>
							</ul>
							<h5 className="subtitle is-6">v0.1.0{" "}<span className="is-muted">(2024-07-08)</span></h5>
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

function Feat() {
	return <span className="icon has-text-success" title="New Feature or Improvement"><i className="fas fa-wrench"></i></span>
}
function Bug() {
	return <span className="icon has-text-danger" title="Bugfix"><i className="fas fa-bug-slash"></i></span>
}