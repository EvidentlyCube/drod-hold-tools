import type { ReactNode } from "react";

export interface ChangelogChange {
	type: "feature" | "bug" | "none";
	description: ReactNode;
}

export interface ChangelogVersion {
	version: string;
	releaseDate: string;
	logs: ChangelogChange[];
}

export const Changelog: readonly ChangelogVersion[] = [
	{
		version: "v1.1.0",
		releaseDate: "Unreleased",
		logs: [
			{
				type: "feature",
				description: <>Can now edit hold description and end message.</>,
			},
			{
				type: "bug",
				description: (
					<>
						Because DROD stores newlines differently from how HTML handles them
						editing multiline strings could cause things to behave weird in
						DROD. This is fixed now.
					</>
				),
			},
		],
	},
	{
		version: "v1.0.0",
		releaseDate: "2026-03-31",
		logs: [
			{
				type: "feature",
				description: <>Script export displays imperatives by name</>,
			},
			{
				type: "feature",
				description: <>Mechanism to replace data files in bulk.</>,
			},
			{
				type: "feature",
				description: <>Updated everything to work with 5.2.</>,
			},
			{
				type: "feature",
				description: <>Optimized variable usage calculating.</>,
			},
			{
				type: "feature",
				description: <>Fixed a bunch of subtle bugs with variable renaming.</>,
			},
		],
	},
	{
		version: "v0.1.9",
		releaseDate: "2026-02-20",
		logs: [
			{
				type: "feature",
				description: (
					<>
						Added indents for script export to improve readability, especially
						in editors that automatically support sticky headers based on
						indentation.
					</>
				),
			},
			{
				type: "feature",
				description: <>Added missing enumerations for script export.</>,
			},
		],
	},
	{
		version: "v0.1.8",
		releaseDate: "2026-02-20",
		logs: [
			{
				type: "bug",
				description: (
					<>
						Fixed a case where variable use would not be caught if the variable
						had no spacing around it; which would be also anytime a variable
						"touched" the start or end of the formula. Nasty, especially for
						variable rename.
					</>
				),
			},
		],
	},
	{
		version: "v0.1.7",
		releaseDate: "2026-02-20",
		logs: [
			{
				type: "feature",
				description: <>Detect and list problems with the hold.</>,
			},
			{
				type: "feature",
				description: <>Variable renaming.</>,
			},
			{
				type: "feature",
				description: <>Scanning hold for known issues.</>,
			},
			{
				type: "bug",
				description: (
					<>
						Fix error on import in a few places caused by references to
						non-existent data.
					</>
				),
			},
			{
				type: "bug",
				description: <>Fix error which prevented Data usage to be recorded.</>,
			},
			{
				type: "bug",
				description: (
					<>
						DROD-style newlines (carriage return character) now display properly
						in logs list.
					</>
				),
			},
			{
				type: "bug",
				description: (
					<>Fix variable usage not being properly recognized in text.</>
				),
			},
		],
	},
	{
		version: "v0.1.6",
		releaseDate: "2026-02-19",
		logs: [
			{
				type: "feature",
				description: <>Allow listing variable uses.</>,
			},
			{
				type: "feature",
				description: <>Allow listing character uses.</>,
			},
			{
				type: "feature",
				description: <>Allow deleting data.</>,
			},
			{
				type: "feature",
				description: <>Allow deleting unused speech.</>,
			},
			{
				type: "bug",
				description: <>Fix speaker display in speech to show proper values.</>,
			},
		],
	},
	{
		version: "v0.1.5",
		releaseDate: "2026-02-10",
		logs: [
			{
				type: "feature",
				description: <>Added exporting all hold's scripts.</>,
			},
		],
	},
	{
		version: "v0.1.4",
		releaseDate: "2024-10-13",
		logs: [
			{
				type: "bug",
				description: (
					<>
						Players who only own demos and not levels are now included in the
						exported Hold.
					</>
				),
			},
		],
	},
	{
		version: "v0.1.3",
		releaseDate: "2024-09-01",
		logs: [
			{
				type: "feature",
				description: <>Added page for viewing variables</>,
			},
			{
				type: "bug",
				description: <>Tables were not displaying every 25th element</>,
			},
			{
				type: "bug",
				description: (
					<>
						Exported hold did not change Last Updated date which made it
						impossible to import the hold without deleting it first
					</>
				),
			},
			{
				type: "bug",
				description: (
					<>
						Players with name logs should now correctly update after importing
						to DROD
					</>
				),
			},
		],
	},
	{
		version: "v0.1.2",
		releaseDate: "2024-08-29",
		logs: [
			{
				type: "feature",
				description: <>Players list &rarr; Added</>,
			},
			{
				type: "feature",
				description: <>Levels list &rarr; Edit author + Edit created</>,
			},
			{
				type: "feature",
				description: <>World Map list &rarr; Edit data</>,
			},
			{
				type: "feature",
				description: <>Improved how references are displayed</>,
			},
			{
				type: "bug",
				description: <>Data uses update when used data is changed anywhere</>,
			},
		],
	},
	{
		version: "v0.1.1",
		releaseDate: "2024-07-12",
		logs: [
			{
				type: "feature",
				description: <>Characters list + edit name</>,
			},
			{
				type: "feature",
				description: <>Entrances list + edit description/show description</>,
			},
			{
				type: "feature",
				description: <>Scrolls list + edit message</>,
			},
			{
				type: "feature",
				description: <>Change list sorting + better location displaying</>,
			},
			{
				type: "feature",
				description: (
					<>
						Added a step after importing that validates the hold exports
						correctly
					</>
				),
			},
			{
				type: "feature",
				description: <>Added version validation at the start</>,
			},
			{
				type: "feature",
				description: <>Speeches list &rarr; Edit Mood</>,
			},
			{
				type: "feature",
				description: <>Speeches list &rarr; Edit Data</>,
			},
			{
				type: "feature",
				description: <>Entrances list &rarr; Edit Data</>,
			},
			{
				type: "feature",
				description: <>World Maps list + Edit name</>,
			},
			{
				type: "feature",
				description: <>Characters list &rarr; Edit avatar & tile data IDs</>,
			},
			{
				type: "bug",
				description: (
					<>Table state and config is no longer shared between holds</>
				),
			},
			{
				type: "bug",
				description: (
					<>Hiding columns no longer break the table if it has any filters</>
				),
			},
			{
				type: "bug",
				description: (
					<>
						Fixed a bunch of small differences between DROD-created hold data
						and the data created by the tool
					</>
				),
			},
			{
				type: "bug",
				description: (
					<>Fixed saved games and demos not being lost during export.</>
				),
			},
		],
	},
	{
		version: "v0.1.0",
		releaseDate: "2024-07-08",
		logs: [
			{ type: "none", description: <>Currently released version</> },
			{ type: "none", description: <>Import & Export</> },
			{ type: "none", description: <>Backup hold & logs in browser storage</> },
			{
				type: "none",
				description: <>Edit speeches and level names and data names</>,
			},
			{ type: "none", description: <>Replace data files</> },
		],
	},
];
