/*
 * CONTENT OF THE DETAIL PANELS (the sections that open when you click a "+").
 * This is the only file to edit to change those texts.
 *
 * - experienceDetails: one entry per column 2 card, keyed by the card's year ("2024", "2023", ...).
 * - projectDetails:    one entry per column 3 card, in order (first card, second card).
 *
 * A panel is: kicker (small line) / title / subtitle, then `sections`, then optional `images`.
 * A section has an optional `eyebrow` (small label), an optional `heading`, and `blocks`:
 *   - a string                     = a paragraph
 *   - { bullets: [...] }           = a bullet list; a bullet is a string or { label, text }
 *   - { stats: [{ value, label }] } = a grid of key figures
 *   - { image: { src, alt, caption? } } = an image (import it first), click to enlarge
 *   - { table: { head, rows, caption? } } = a small table
 *   - { code: { tabs: [{ label, language, source }], caption? } } = code; several tabs = a switch (M / Python)
 *
 * Images: put the files in src/assets/ and import them, e.g.
 *   import shot from "@/assets/experiences/thales-dashboard.png";
 *   ...  images: [shot],
 * Nothing is shown for `images` when the list is empty or missing.
 */

import dashVolume from "@/assets/projects/live-chat/dashboard-1-volume.png";
import dashService from "@/assets/projects/live-chat/dashboard-2-service-level.png";
import dashHandle from "@/assets/projects/live-chat/dashboard-3-handle-time.png";
import serviceByHour from "@/assets/projects/live-chat/service-by-hour.png";
import hotelProfile from "@/assets/projects/hotel/guest-profile.png";
import hotelMix from "@/assets/projects/hotel/guest-mix.png";
import hotelNightsAmount from "@/assets/projects/hotel/nights-vs-amount.png";
import hotelAmountDiscount from "@/assets/projects/hotel/amount-vs-discount.png";
import hotelTests from "@/assets/projects/hotel/ten-tests.png";
import hotelChains from "@/assets/projects/hotel/chain-profiles.png";
import hotelContrib from "@/assets/projects/hotel/where-the-link-lives.png";
import { R_DESCRIBE, SAS_DESCRIBE, R_CORR, SAS_CORR, R_TESTS, SAS_TESTS, R_PROFILES, SAS_PROFILES } from "@/hotelCode";
import filtersPanel from "@/assets/projects/live-chat/filters-panel.png";
import { LIVE_CHAT_M, LIVE_CHAT_PYTHON, DAX_REQUIRED_FTE, DAX_FRT_DONUT, DAX_FRT_HISTOGRAM, DAX_AHT, DAX_AHT_INDEX } from "@/liveChatCode";

export type Bullet = string | { label: string; text?: string };
/** Code shown with tabs (e.g. Power Query M / Python). Comments are greyed-green automatically. */
export type CodeTab = { label: string; language: "m" | "python" | "dax" | "r" | "sas"; source: string };
export type Block =
  | string                                                        // a paragraph
  | { bullets: Bullet[] }                                         // a bullet list
  | { stats: { value: string; label: string }[] }                 // key figures
  | { image: { src: string; alt: string; caption?: string } }     // an image, click to enlarge
  | { table: { head: string[]; rows: string[][]; caption?: string } }
  | { code: { tabs: CodeTab[]; caption?: string } };
export type Section = { eyebrow?: string; heading?: string; blocks: Block[] };
export type Detail = {
  kicker: string;
  title: string;
  subtitle: string;
  sections: Section[];
  images?: string[];
};

export const experienceDetails: Record<string, Detail> = {
  /* ------------------------------------------------------------------ 2024 · Thales Alenia Space */
  "2024": {
    kicker: "2024 · Madrid",
    title: "Thales Alenia Space",
    subtitle: "Data engineering and dataviz on the satellite payload production line",
    sections: [
      {
        blocks: [
          "I worked in the aerospace sector, on the production line of the satellite payload: the heart of the satellite, the electronic board on which all the components come together.",
        ],
      },
      {
        heading: "Bringing very different data sources together",
        blocks: [
          "My first assignment was to consolidate and reconcile data from highly heterogeneous sources:",
          {
            bullets: [
              { label: "Production machines", text: "solder paste inspection, component placement, optical inspection, X-ray" },
              { label: "Management software", text: "Axapta, Primavera, Lotus Notes" },
            ],
          },
          "These systems were neither structured nor designed alike. I built ETL workflows in Dataiku DSS, combining Python and regular expressions, to unify them in a single automated pipeline.",
          "The Primavera workflow handled the largest volume of data, since previous years had to be kept for comparison, and it was completely redesigned. I reduced its architecture from 166 items to 71 and introduced partitioned datasets that target only the data needed by the dashboard being refreshed, with regular expressions selecting the right files from Amazon S3 and the right sheet in each file. The year is now driven by a variable and a DSS scenario, and the previous version is archived in Git. Processing time was cut by more than 50%, and the whole pipeline now runs through DSS scenarios with no manual intervention.",
        ],
      },
      {
        heading: "Power BI dashboards and migration",
        blocks: [
          "Once the data was cleaned and structured, I developed Power BI dashboards. They had to be information-dense, with numerous KPIs and filters and a distinct audience on each page. To keep them readable, including for non-technical users, I used bookmarks, pop-up filters, tooltips and sub-dashboards.",
          "I also led the full migration of the legacy dashboards from Qlik Sense to Power BI, which involved redoing the data processing and aligning every dashboard with the new reporting standards, notably in terms of data governance.",
        ],
      },
      {
        heading: "Data governance",
        blocks: [
          "At the end of each pipeline, I used the data lineage feature of DSS to trace every source of the datasets feeding the dashboards. I documented the result in a Data Assessment listing the data used (the columns) and its level of confidentiality.",
          "For sensitive data, restricted to certain departments or traceable to individual employees, I met the data owners to validate the intended use and define the group of people authorized to access the corresponding dashboards.",
        ],
      },
      {
        heading: "Beyond the technical side",
        blocks: [
          "The Capacity project shows the range of contexts I worked in. The company had brought in an external consulting firm to improve workload and workforce management across its departments, and that firm called on me to build the dashboards supporting its work. It was once again a different situation: new data from every department, stakeholders from both the consulting firm and the internal teams, and a pace that demanded speed and adaptability. I built the data pipeline from scratch, collecting, combining and cleaning the data and automating the whole process, then delivered the dashboards, which were used regularly and had a high impact.",
          "More broadly, the assignment was a rewarding experience, professionally and personally: working in Madrid, switching between three languages, and collaborating with technical and non-technical teams across several departments.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ 2023 · Groupinvesto */
  "2023": {
    kicker: "2023 · Toulouse",
    title: "Groupinvesto",
    subtitle: "Creating a collaborative real estate investment website from the ground up",
    sections: [
      {
        blocks: [
          "In 2023, I joined a forward-thinking startup where I led the creation of a real estate website from the ground up. GROUPINVESTO brings a modern and innovative approach to real estate by favoring collaborative investments. This platform allows users to invest the amount they want on the chosen property before getting in touch with future co-investors thanks to advisors.",
        ],
      },
      {
        heading: "Vue 3 for a dynamic UI",
        blocks: [
          "To create a modern and intuitive user interface, I turned to Vue 3, a progressive JavaScript framework known for its reactivity and effortless integration. Vue 3 allowed me to build a dynamic frontend that seamlessly interacted with the backend, resulting in a smooth and engaging user experience.",
        ],
      },
      {
        heading: "Tailwind CSS: aesthetic excellence with efficiency",
        blocks: [
          "In order to reach a streamlined aesthetic, Tailwind CSS became an obvious choice as my go-to utility-first CSS framework. This decision allowed me to rapidly style and design the website, achieving a visually pleasing and responsive layout without compromising on efficiency.",
        ],
      },
      {
        heading: "Securing data with JSON Web Token authentication",
        blocks: [
          "Ensuring utmost security and privacy for our users was very important. To achieve this, I implemented JSON Web Token (JWT) authentication, a robust and industry-standard method for securing data transmission. This approach significantly enhanced the website's security, providing our users with a safe and trustworthy environment.",
        ],
      },
      {
        heading: "Results that resonate",
        blocks: [
          "The end result was a website that seamlessly combined functionality, aesthetics, and security. Users experienced a sleek, responsive interface, enabling effortless navigation and interaction. Additionally, the startup achieved heightened user engagement and positive feedback, setting the stage for future growth and success.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ 2021 · Orange */
  "2021": {
    kicker: "2021 · Toulouse",
    title: "Orange",
    subtitle: "Nationwide fiber optics network deployment monitoring",
    sections: [
      {
        blocks: [
          "At a pivotal juncture in my career, I had the distinct privilege of contributing to a great telecommunications initiative at Orange. Tasked with overseeing the deployment of a fiber optics network spanning metropolitan France, I embarked on a journey that showcased the transformative power of data-driven decision-making.",
        ],
      },
      {
        heading: "Harnessing data for strategic insights",
        blocks: [
          "My primary mission was to establish a robust monitoring system, leveraging the potential of data analytics to provide strategic insights into the nationwide deployment. Recognizing the pivotal role of accurate and up-to-date data, I set out to create an automated data pipeline, a lifeblood for informed decision-making.",
        ],
      },
      {
        heading: "Data pipeline and ETL process",
        blocks: [
          "Despite the constraint of not being able to use a traditional ETL, I was able, through the use of Excel, VBA, and SQL Server, to orchestrate a data pipeline that seamlessly extracted, transformed, and loaded critical deployment data. This automation ensured that each week, the data was updated effortlessly, maintaining its relevance and accuracy.",
        ],
      },
      {
        heading: "Empowering with VBA macros",
        blocks: [
          "The heart of this automation lay in VBA macros. These macros powered the automated ETL process, pulling data from various sources, transforming it into a meaningful format, by elaborating the required data warehouse and data marts. This level of automation made the information much more accessible and significantly optimized efficiency.",
        ],
      },
      {
        heading: "Dynamic Power BI dashboards",
        blocks: [
          "On this robust data foundation, I built Power BI dashboards that presented a dynamic and real-time view of the network deployment. These dashboards not only provided a visual narrative of the progress but also allowed for in-depth analysis and insights. Stakeholders could effortlessly track the deployment's status, identify bottlenecks, and make informed decisions to ensure the project's success.",
        ],
      },
      {
        heading: "Impact and continued evolution",
        blocks: [
          "The result of this effort was a significant time saver within the organization, where data-driven decisions became the cornerstone of the nationwide fiber optics network deployment. The system I engineered not only streamlined operations but also empowered stakeholders with the actionable intelligence necessary to drive progress. This experience reinforced my belief in the transformative potential of data analytics, showcasing how innovation and resourcefulness can overcome challenges. It cemented my commitment to leveraging the power of data to drive positive change and operational excellence.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ 2019 · Airbus */
  "2019": {
    kicker: "2019 · Toulouse",
    title: "Airbus",
    subtitle: "Network infrastructure renewal in aeronautics",
    sections: [
      {
        blocks: [
          "In the fast-paced realm of aeronautics, where precision and efficiency reign supreme, I was entrusted with a pivotal role in the overhaul of network infrastructure for a leading aeronautics company. This undertaking challenged me to elevate monitoring, establish critical KPIs, and drive productivity, all while adhering to agile principles.",
        ],
      },
      {
        heading: "Empowering data-driven decision-making",
        blocks: [
          "My primary goal was to improve the way we monitored network infrastructure renewal. Harnessing the power of data analytics, I aimed to provide real-time insights that would steer decision-making, bolster productivity, and ensure the seamless operation of critical network systems. In pursuit of this vision, I designed and developed intuitive dashboards that offered a comprehensive and real-time view of the network infrastructure renewal. These dashboards served as an interactive window, empowering stakeholders to monitor progress, identify potential roadblocks, and make informed decisions swiftly and effectively.",
        ],
      },
      {
        heading: "Key Performance Indicators (KPIs)",
        blocks: [
          "Recognizing the importance of tracking technician productivity, I established key performance indicators (KPIs). These KPIs were meticulously crafted to gauge various aspects of productivity, enabling us to measure progress, identify areas for improvement, and optimize resource allocation.",
        ],
      },
      {
        heading: "Agile practices and JIRA integration",
        blocks: [
          "Operating within the agile framework, I diligently managed tickets and workflows utilizing JIRA. This integration facilitated seamless communication, task tracking, and iterative development, aligning our efforts with agile principles to maximize efficiency and ensure project success.",
        ],
      },
      {
        heading: "Empowering excellence and progress",
        blocks: [
          "The refined monitoring systems and productivity-focused approach significantly improved the renewal process. Stakeholders were equipped with the tools and insights needed to steer the project towards success, ensuring a robust network infrastructure for critical operations. This experience crystallized my belief in the potential of data-driven solutions and the transformative influence of agile methodologies. It affirmed my dedication to utilizing technology and innovation to drive progress in critical and dynamic sectors like aeronautics.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ 2018 · FamilyWall */
  "2018": {
    kicker: "2018 · Paris",
    title: "FamilyWall",
    subtitle: "Internship: elevating Business Intelligence in the social network industry",
    sections: [
      {
        blocks: [
          "During a pivotal internship in the social network industry, I collaborated with a dynamic small-scale company that was determined to enhance its B2B offerings. This enriching experience saw me undertake two primary tasks: automating existing business reports and developing dashboards to showcase the app's value proposition for potential B2B clients.",
        ],
      },
      {
        heading: "Automating business reports",
        blocks: [
          "At the outset, I delved into the existing reporting system, identifying opportunities to streamline and automate the reporting process. Leveraging my expertise, I crafted automated workflows that significantly reduced manual efforts, ensuring timely and accurate generation of essential business reports. This automation not only increased efficiency but also freed up valuable time for the team to focus on strategic endeavors.",
        ],
      },
      {
        heading: "Empowering B2B growth with dashboards",
        blocks: [
          "The second aspect of my internship involved the creation of comprehensive dashboards to catalyze the B2B growth trajectory. The objective was clear: showcase the app's value to potential corporate clients seeking a premium version. I meticulously designed dashboards that succinctly illustrated the app's advantages, focusing on how it could enhance their operations, engagement, and overall user experience. These dashboards proved instrumental in communicating the app's value proposition and fostering meaningful conversations with prospective B2B partners.",
        ],
      },
      {
        heading: "Driving expansion and innovation",
        blocks: [
          "This internship was a rewarding journey, where I witnessed firsthand the impact of data-driven decision-making in the ever-evolving social networking landscape. The automation of business reports not only optimized internal processes but also laid the foundation for data-driven insights. Simultaneously, the tailored dashboards empowered the company to effectively position their product, paving the way for potential partnerships and expansion into the B2B market.",
        ],
      },
    ],
  },
};

/* ---------------------------------------------------------------------- column 3 cards */
export const projectDetails: Detail[] = [
  /* ---------------------------------------------------------------- project 1 · 4-week live chat analysis */
  {
    kicker: "Project · Business case",
    title: "4-week live chat analysis",
    subtitle: "From 50,000 raw log rows to a 3-page Power BI dashboard on demand, service level and handle time, with a pop-up filter panel",
    sections: [
      {
        blocks: [
          "A customer-support live chat answered first by a chatbot, then by two contact centers (PCC and CCW), in English and six other languages. I received four weeks of raw chat logs (23 July to 19 August) and one job: tell operations where the service is under pressure and what to do about it.",
          "My approach: clean the log, make every assumption explicit and adjustable, then tell the story page by page in Power BI.",
          {
            stats: [
              { value: "34,929", label: "chats analysed" },
              { value: "-39%", label: "volume, week 1 to week 4" },
              { value: "26%", label: "resolved by the bot alone" },
              { value: "59%", label: "answered in under 6 min" },
              { value: "4 min", label: "median first response (mean 6.9)" },
              { value: "16 min", label: "median handle time (targets: 10 and 12)" },
            ],
          },
        ],
      },

      /* ---- 1 · dataset ---- */
      {
        eyebrow: "Step 1",
        heading: "The dataset",
        blocks: [
          "One sheet, 8 columns, one row per engagement: every time the bot or a contact center touched a chat.",
          {
            bullets: [
              { label: "Ticket ID", text: "the chat identifier" },
              { label: "Agent Name Region Simple", text: "who engaged: PCC, CCW, or Chat Bot User for the bot" },
              { label: "Chat language", text: "EN, IT, FR, ES, DE, PL or PT, written with a CS T1 prefix" },
              { label: "Engagement assignment", text: "Assignment Accepted (the bot handed the chat over and the contact center accepted), Assignment Missed (the hand-over was missed), Self-assigned (taken directly)" },
              { label: "Chat started, Engagement, Chat updated", text: "three timestamps: creation of the chat, each engagement, last message" },
              { label: "Engagements", text: "always 1, no information, dropped" },
            ],
          },
        ],
      },

      /* ---- 2 · data quality ---- */
      {
        eyebrow: "Step 2",
        heading: "Data quality",
        blocks: [
          "The integrity is good: right data types, no null values, no exact duplicates, and the timestamps always follow a logical order. The interesting part is what the log does not say.",
          {
            bullets: [
              { label: "50,000 rows for 34,929 chats", text: "57% of the chats have one row, 43% have two, and 69 have three or more (two have 7)." },
              { label: "The bot greeting is not always logged", text: "only 23,984 chats (69%) have a bot engagement. The other 10,945 reach a contact center directly, so the bot greeting time has to stay empty-able." },
              { label: "11 chats nobody answered", text: "offered to a contact center, missed every time, no bot trace. They would pass for bot-only chats, so I flag them." },
              { label: "46 chats with missed hand-overs", text: "67 missed assignments in total: a small routing friction." },
              { label: "Extreme values", text: "4 chats waited between 126 and 765 minutes for a first answer, and one chat stayed open for 32 days. With them, the average handle time would be 502 minutes against a median of 16." },
              { label: "No time zone", text: "the first agent answer lands at 08:00 on weekdays and 09:00 at weekends, one hour before the stated opening times (09:00 and 10:00). The log is one hour behind the local clock, most likely UTC. I kept the clock of the log everywhere." },
              { label: "Missing business inputs", text: "no first-response target, no shrinkage, occupancy or concurrency, no contact reason. Hence the assumptions below." },
            ],
          },
        ],
      },

      /* ---- 3 · assumptions ---- */
      {
        eyebrow: "Step 3",
        heading: "Assumptions",
        blocks: [
          "Every assumption is a parameter of the report, so that a manager can challenge it and see the effect immediately.",
          {
            bullets: [
              { label: "Concurrency: 2", text: "without a contact reason on each chat I cannot tell simple chats from complex ones, so I used a standard 2 chats in parallel per agent" },
              { label: "Shrinkage: 28%", text: "8% productive (meetings, training, coaching) and 20% non-productive (breaks, holidays, sickness, system downtime)" },
              { label: "Occupancy: 85%", text: "the share of an agent's available time spent actively handling chats" },
              { label: "Contract: 40 hours per week" },
              { label: "First response target: 6 minutes", text: "a slider, because none was provided" },
              { label: "Handle time targets: 10 minutes (English), 12 minutes (other languages)", text: "a chat is within the band when it is at most 20% above or below its target" },
              { label: "Outliers", text: "handle time above 60 minutes (13% of the human chats) and first response above 60 minutes (20 chats) are flagged and left out of the averages and the required FTE. Medians, percentiles, the SLA and the share within target use every chat. I first cut at 30 minutes, which removed 25% of the chats: that is a selection of short chats, not an outlier rule" },
            ],
          },
        ],
      },

      /* ---- 4 · restructuring ---- */
      {
        eyebrow: "Step 4",
        heading: "Data restructuring",
        blocks: [
          "An engagement log is the wrong shape for KPIs: counting rows would count a chat several times. I rebuilt it with one row per chat, keeping the information instead of the duplicates.",
          {
            bullets: [
              "Group by Ticket ID: chat start, chat end and language are identical on every row of a chat, so they group safely.",
              "Missed hand-overs are removed from the rows but counted in a Missed Assignment Count column.",
              "A Bot Greeting TS column keeps the bot's timestamp without keeping its row.",
              "First Response TS: the first Accepted or Self-assigned engagement of a contact center, bot excluded.",
              "The contact center is redefined as CCW, PCC, CCW & PCC (both took part) or Only Chat Bot.",
              "The language is cleaned: CS T1 EN becomes EN.",
            ],
          },
          "Two measures come out of it, in minutes: FRT (first response time) = First Response TS - Chat Started TS, and AHT (average handle time) = Chat Last Update TS - First Response TS. Whole minutes, like DATEDIFF: 16:19:32 to 16:24:37 counts as 5.",
          "One chat, before and after (ticket 79160358, started 16:19:32):",
          {
            table: {
              head: ["Engaged", "Assignment", "Time"],
              rows: [
                ["Chat Bot User", "Self-assigned", "16:19:32"],
                ["CCW", "Assignment Missed", "16:24:37"],
                ["CCW", "Self-assigned", "16:24:37"],
                ["CCW", "Assignment Missed", "16:46:04"],
                ["CCW", "Self-assigned", "16:46:04"],
                ["PCC", "Assignment Missed", "17:03:52"],
                ["PCC", "Self-assigned", "17:03:52"],
              ],
              caption: "Before: 7 rows",
            },
          },
          {
            table: {
              head: ["Field", "Value"],
              rows: [
                ["Contact center", "CCW & PCC"],
                ["Bot Greeting TS", "16:19:32"],
                ["First Response TS", "16:24:37"],
                ["Chat Last Update TS", "17:47:16"],
                ["Missed Assignment Count", "3"],
                ["FRT", "5 min"],
                ["AHT", "83 min (an outlier)"],
              ],
              caption: "After: 1 row",
            },
          },
          "The same logic in Power Query (M), as built in Power BI, and in Python (pandas). Use the switch:",
          {
            code: {
              tabs: [
                { label: "Power Query (M)", language: "m", source: LIVE_CHAT_M },
                { label: "Python", language: "python", source: LIVE_CHAT_PYTHON },
              ],
              caption: "Result: 34,929 rows, one per chat. PCC 16,608, CCW 9,234, Only Chat Bot 9,079, CCW & PCC 8.",
            },
          },
        ],
      },

      /* ---- 5 · dashboard ---- */
      {
        eyebrow: "Step 5",
        heading: "The dashboard, page by page",
        blocks: [
          "Three pages, one story: how much demand is there, are customers answered fast enough, and how long does each chat take? A filter panel, described after the three pages, lets the reader cut the data any way they like.",
        ],
      },
      {
        eyebrow: "Page 1",
        heading: "Volume and demand: how much work is there?",
        blocks: [
          { image: { src: dashVolume, alt: "Dashboard page 1: volume and demand analysis", caption: "Volume and demand analysis (click to enlarge)" } },
          "Chat volume falls every week, from 10,580 chats in week 1 to 6,406 in week 4 (-39%), and the Required FTE line follows it: the need falls by about 40% over the same weeks. The four sliders above the chart (concurrency, occupancy, hours per FTE contract, shrinkage) rewrite that line live. The screenshot shows 80% occupancy and 30% shrinkage: on this setting the need goes from roughly 20 agents on a weekend day to roughly 55 on the busiest weekdays.",
          {
            bullets: [
              { label: "Weekly rhythm", text: "a weekday averages 1,408 chats (Monday is the busiest, 1,490) and a weekend day 846, 60% of a weekday. Weekends bring 19% of the volume." },
              { label: "Weekday against weekend, hour by hour", text: "on a weekday, volume peaks as soon as the service opens (153 chats in the 08:00 hour, on average) and then fades slowly. At weekends the day starts an hour later, peaks lower (136 chats at 09:00) and stops around 17:00. The chart shows the average per day, not the total: the period holds 20 weekdays and only 8 weekend days, so totals would make weekdays win by construction. The dotted lines mark the operating hours." },
              { label: "Languages", text: "English is 58% of the chats, then Italian 17%, French 8%, Spanish 7%, German 5%, Polish 4% and Portuguese 2%." },
              { label: "Bot and contact centers", text: "the bot resolves 26% of the chats alone (9,079). PCC handles 16,608 chats, CCW 9,234, and 8 chats needed both." },
              { label: "Peaks", text: "27 July (1,830 chats), 28 July (1,771) and 23 July (1,740). The busiest hours are 09:00, 10:00 and 11:00 (4,073, 3,856 and 3,591 chats), and the busiest hour of the day is before noon on 26 of the 28 days. The heat map shows it week by week, day by day, hour by hour." },
            ],
          },
          "A trap worth naming: on the chart the weekday peak sits one hour before the stated opening time, which looks like a case for starting earlier. But agents already answer from 08:00 every day: the log is simply one hour behind the local clock. There is no hidden demand before opening, only an opening rush.",
          "The Required FTE measure:",
          { code: { tabs: [{ label: "DAX", language: "dax", source: DAX_REQUIRED_FTE }] } },
        ],
      },
      {
        eyebrow: "Page 2",
        heading: "Service level: are customers answered fast enough?",
        blocks: [
          { image: { src: dashService, alt: "Dashboard page 2: service level and queue performance", caption: "Service level and queue performance (click to enlarge)" } },
          "With a 6-minute target, set with a slider because none was provided, 59.4% of the 25,850 chats handled by humans are answered in time (15,364) and 40.6% are not (10,486). One number is not enough to describe the wait: the median is 4 minutes (25th percentile 2, 75th 9), but the mean is 6.9 and 1 chat in 10 waits more than 15 minutes.",
          {
            bullets: [
              { label: "The distribution", text: "one bar per minute of waiting, green below the target and red above, with the cumulative share as a line: 59% of the chats are answered within 5 minutes, 80% within 10 and about 90% within 15. The last bar groups the 468 chats that waited 30 minutes or more (1.8%); the longest waited 765 minutes. Move the slider and the colours follow." },
              { label: "Worst days", text: "11 August (12.9 minutes on average), 12 August (11.3) and 31 July (8.8)." },
              { label: "Worst hours", text: "the edges of the day: 07:00 (13.8 minutes), 17:00 (11.2) and 18:00 (17.8). Midday, 12:00 to 14:59, is the best: 78% in time." },
              { label: "Contact centers", text: "PCC answers in 7.25 minutes on average, CCW in 6.15, and PCC carries 64% of the human chats, 1.8 times the volume of CCW. PCC is not slower once it has a chat (17.2 against 17.9 minutes of handle time): the issue is pick-up capacity." },
              { label: "Languages", text: "Italian, the second market, gets the slowest first answer: 8.2 minutes against 6.5 in English." },
              { label: "Over the month", text: "the share answered in time falls from 70% in week 1 to between 52% and 56% afterwards, while the volume falls by 39%. The day-by-day chart at the bottom shows the average wait (bars) and the share in time (line): both break around 11 and 12 August, the two worst days." },
            ],
          },
          "A first version of this page plotted volume against SLA % to answer the usual question: do volume spikes cause breaches? I removed that scatter plot from the final report because it mostly showed volume, but the answer is worth keeping, and it is the opposite of the intuition. By hour of the day, the busier the hour, the better the service (correlation +0.69). At day level the correlation is nearly zero (+0.05). Breaches are a coverage problem, not a volume problem: the opening rush (08:00 to 10:59, a third of all chats, 48% in time against 78% at midday) and the end-of-day taper (17:00 to 19:59: 27% in time while volume falls).",
          { image: { src: serviceByHour, alt: "Chats handled by humans and share answered in under 6 minutes, by hour of the day", caption: "Volume (bars) against share answered in under 6 minutes (line), by hour of the day" } },
          "Long waits are never hidden: the SLA, the donut and the distribution count every chat, and only the averages on the day and hour cards leave out the 20 chats above an hour. The donut is driven by this measure, which recounts the chats each time the target slider moves:",
          { code: { tabs: [
            { label: "DAX: donut", language: "dax", source: DAX_FRT_DONUT },
            { label: "DAX: histogram", language: "dax", source: DAX_FRT_HISTOGRAM },
          ] } },
        ],
      },
      {
        eyebrow: "Page 3",
        heading: "Handle time: how long does a chat take?",
        blocks: [
          { image: { src: dashHandle, alt: "Dashboard page 3: handle time and AHT analysis", caption: "Handle time and AHT analysis (click to enlarge)" } },
          "Handle time is heavily skewed: the median is 16 minutes, the 25th percentile 10 and the 75th 31, while the mean (17.5 minutes once chats above an hour are capped) is pulled up by a long tail. This is why the page leads with the median. Against the targets of 10 minutes for English and 12 minutes for the other languages, the median is at 160% of the target for English and 133% for the others: both are above target. Each group is divided by its own target, so a single 100% line serves both.",
          {
            bullets: [
              { label: "Week by week", text: "median handle time as a share of the target: English 160%, 165%, 160% and 150% from week 1 to week 4, other languages 133%, 133%, 142% and 133%. Medians move in half-minute steps, so a 5-point change is 30 seconds: the picture is flat, not improving." },
              { label: "Same time in every language", text: "the median is 16 minutes in English and in the other languages: the 2-minute gap between the targets does not exist in practice, so the targets do not reflect how complex the chats really are." },
              { label: "Contact centers", text: "CCW 17.9 minutes on average, PCC 17.2." },
              { label: "The band", text: "only 20.5% of the chats (5,304 of 25,850) are within 20% of their target. 60% are more than 20% over it and 20% more than 20% under: the problem is dispersion, not a shifted average. A single target cannot describe a mix of quick and very long chats." },
              { label: "Outliers", text: "13% of the human chats (3,295) last more than an hour and 8% (2,060) more than four hours, up to 32 days. These are almost certainly chats left open, not real handling time, and handle time is much more sensitive to them than the first response: capped at 30 minutes, the mean is 13.6; capped at 60, 17.5; at four hours, 22.2; with no cap, 502. So the median carries the page, and the mean and the required FTE use an explicit 60-minute cap. A closing event on inactivity would tell real long chats from forgotten ones." },
            ],
          },
          "The handle time and its comparison with the targets, in the model:",
          { code: { tabs: [
            { label: "DAX: AHT", language: "dax", source: DAX_AHT },
            { label: "DAX: vs target", language: "dax", source: DAX_AHT_INDEX },
          ] } },
        ],
      },
      {
        eyebrow: "Interface",
        heading: "A filter panel that stays out of the way",
        blocks: [
          { image: { src: filtersPanel, alt: "Page 1 with the filters panel open over the report", caption: "The filters panel, open over page 1 (click to enlarge)" } },
          "Filtering is optional and it needs a lot of room, so it does not live on the canvas. Each page has a Filters button in the header, next to the page title. It opens a floating panel above the report; the button turns dark blue while the panel is open, and Close puts the report back as it was. Reset Filters restores the full dataset in one click.",
          {
            bullets: [
              { label: "Tiles", text: "contact center (CCW, CCW & PCC, Only Chat Bot, PCC), chat language and week number are buttons: one click to select, no drop-down to open." },
              { label: "Ranges", text: "chat start date and hour, plus a range on the first response time (up to 765 minutes) and on the handle time (up to 46,114 minutes, the chat open for 32 days). The reader can apply their own outlier threshold." },
              { label: "Two kinds of controls", text: "the assumptions (concurrency, occupancy, shrinkage, contract hours) and the SLA target are parameters of the model, so they stay on the page as sliders, next to the chart they rewrite. The filters only slice the data, so they go in the panel." },
              { label: "One layout", text: "the three pages share the same header (case name, page title, Filters button), the same cards on the left (top 3 days and hours, worst 3 days and hours) and the same blue palette, so that a reader who has understood one page can read the other two." },
            ],
          },
        ],
      },

      /* ---- conclusions ---- */
      {
        eyebrow: "Conclusions",
        heading: "What I would do next",
        blocks: [
          {
            bullets: [
              { label: "Front-load the schedule", text: "the first three hours carry 32% of the chats and only 48% are answered in time, against 78% at midday. Move capacity from the afternoon to the opening rush." },
              { label: "Fix the end-of-day taper", text: "from 17:00 to 19:59 the wait jumps to 11 to 18 minutes while the volume falls: it points to staffing roll-off, not to demand." },
              { label: "Plan from the Required FTE curve", text: "the need falls by about 40% in four weeks, yet the share answered in time fell from 70% to 52-56%: the capacity plan is not following demand. Re-forecast every week." },
              { label: "Rebalance PCC and CCW", text: "PCC takes 64% of the human chats and answers more slowly." },
              { label: "Revisit the handle time targets", text: "tag the contact reason of each chat: with 20.5% of the chats in the band and the same median in every language, one target per language is not actionable." },
              { label: "Improve the data", text: "log the bot greeting systematically, close inactive chats automatically, and add a time zone to the timestamps." },
            ],
          },
          "Built with Power BI, Power Query (M), DAX and Python (pandas).",
        ],
      },
    ],
  },
  /* ---------------------------------------------------------------- project 2 · hotel guest analysis (R and SAS) */
  {
    kicker: "Project · Statistics",
    title: "Hotel guest analysis in R & SAS",
    subtitle: "What 236 hotel stays reveal about who spends more, who stays longer and which chain attracts whom",
    sections: [
      {
        blocks: [
          "A hotel group runs four chains and wants three answers: who are its guests, what makes a bill bigger, and does each chain really attract a different clientele? I was given 236 stays described by nine variables. I answered the three questions in R, then rebuilt every step in SAS.",
          "It started as a statistics project, so I kept what a decision-maker needs from each test: a plain-language reading, a number to act on, and an honest word on how far to trust it. The code behind every step is at the end, in R with its SAS equivalent.",
          {
            stats: [
              { value: "236", label: "stays analysed" },
              { value: "89%", label: "of the bill explained by the number of nights" },
              { value: "55 €", label: "more per extra night, on average" },
              { value: "10", label: "relationships between labels tested" },
              { value: "1", label: "still holds after correcting for ten tests" },
              { value: "R + SAS", label: "every analysis in both languages" },
            ],
          },
        ],
      },

      /* ---- 1 · the data ---- */
      {
        eyebrow: "Step 1",
        heading: "The dataset",
        blocks: [
          "One row per stay. Four numbers describe the guest and the bill, five labels describe the stay. The file is in French: I translated the labels here, and the code keeps the original column names.",
          {
            table: {
              head: ["Variable", "What it is", "Values"],
              rows: [
                ["Age", "Age of the guest", "18 to 85 years"],
                ["Nuitees", "Nights stayed", "1 to 9"],
                ["Montant", "Amount billed", "50 to 657 €"],
                ["Reduction", "Discount granted", "0 to 58.4 €"],
                ["Type", "Board type", "Room only, Half board, Full board"],
                ["Motif", "Purpose of the stay", "Business, Leisure"],
                ["Chaine", "Hotel chain", "Campanule, Etophotel, Formule 0, Navotel"],
                ["Origine", "Booking source", "Travel agency, Direct, Guidebook, Internet, Tourist office, Walk-in"],
                ["Sexe", "Gender", "Women, Men"],
              ],
            },
          },
        ],
      },

      /* ---- 2 · the guests ---- */
      {
        eyebrow: "Step 2",
        heading: "Meet the typical guest",
        blocks: [
          "There isn't one. Every number describing the guests is spread wide, which is the first finding: a single average guest would describe almost nobody.",
          { image: { src: hotelProfile, alt: "Histogram of guest ages and bar chart of the length of stay", caption: "Age of the guests and length of stay (click to enlarge)" } },
          {
            table: {
              head: ["", "Min", "Q1", "Median", "Mean", "Q3", "Max", "Spread"],
              rows: [
                ["Age", "18", "32", "50.5", "49.5", "64", "85", "0.38"],
                ["Nights", "1", "2", "5", "4.8", "7", "9", "0.57"],
                ["Amount (€)", "50", "100", "250", "266", "400", "657", "0.61"],
                ["Discount (€)", "0", "0", "0", "4.75", "5", "58.4", "1.94"],
              ],
              caption: "Q1 and Q3 are the 25th and 75th percentiles. Spread is the standard deviation divided by the mean: above 0.25, a variable is heterogeneous.",
            },
          },
          {
            bullets: [
              { label: "Age", text: "half of the guests are over 50. The histogram has two humps, one around 25 to 30 and one around 50 to 55 (the most frequent age is 52), with a dip in the early forties: younger travellers and the over-50s." },
              { label: "Length of stay", text: "the most common stay is a single night (45 stays, 19%), then five nights (33) and eight (32). Half of the guests stay five nights or less." },
              { label: "The bill", text: "half of the stays cost 250 € or less and one in four more than 400 €, up to 657 €." },
              { label: "Discounts", text: "most guests get none: the median is 0 and three quarters get 5 € or less, but a few get a lot (up to 58.4 €). That tail pulls the mean up to 4.75 €, which is why I read the median first." },
            ],
          },
          "And the mix of stays, from the flat count of each label:",
          { image: { src: hotelMix, alt: "Share of stays by board type, purpose, gender, chain and booking source", caption: "Share of the 236 stays, label by label (click to enlarge)" } },
          "Leisure is 56% of the stays, men 60%, half board 52%. The four chains are similar in size (22 to 29% each). Guidebooks are the first booking source (30%), ahead of the internet (24%); walk-ins are 7%.",
        ],
      },

      /* ---- 3 · what drives the bill ---- */
      {
        eyebrow: "Step 3",
        heading: "What makes a bill bigger?",
        blocks: [
          "I tested the six pairs of numeric variables for a linear relationship. How to read it: r runs from 0 (nothing) to 1 (perfect), and a p-value under 0.05 means the link is unlikely to be chance.",
          {
            table: {
              head: ["Pair", "r", "95% interval", "p-value", "Verdict"],
              rows: [
                ["Nights × Amount", "0.945", "0.929 to 0.957", "< 0.0001", "Very strong"],
                ["Nights × Discount", "0.262", "0.139 to 0.377", "0.00005", "Weak"],
                ["Amount × Discount", "0.244", "0.120 to 0.361", "0.0002", "Weak"],
                ["Nights × Age", "0.118", "-0.010 to 0.242", "0.071", "None detected"],
                ["Amount × Age", "0.118", "-0.010 to 0.242", "0.070", "None detected"],
                ["Discount × Age", "0.090", "-0.038 to 0.215", "0.170", "None detected"],
              ],
              caption: "Pearson correlation tests on 236 stays.",
            },
          },
          {
            bullets: [
              { label: "Nights drive the bill, almost by definition", text: "r = 0.945 means 89% of the differences between bills come from the length of stay, and each extra night adds about 55 € on average. A bill is nights multiplied by a nightly rate, so this is mechanics more than discovery." },
            ],
          },
          { image: { src: hotelNightsAmount, alt: "Scatter plot of the amount billed against the number of nights", caption: "Amount billed (Montant, €) against nights stayed (Nuitees): the stays fall on two straight lines (R plot, click to enlarge)" } },
          "The chart holds the useful part. The stays sit on two perfectly straight lines, one at 50 € a night and one at 73 €: a price grid, not noise. So revenue per stay depends on two things, how long a guest stays and which of the two rates applies. This dataset does not say what puts a guest on the higher rate; board type is my first suspect, and it is the first thing I would test.",
          {
            bullets: [
              { label: "Discounts", text: "follow the length of stay and the bill only weakly (r = 0.26 and 0.24). In the chart below they sit on three levels: none, 5% or 10% of the bill (my reading of the chart), and most guests are on the zero line." },
              { label: "Age", text: "does not matter: no relationship with nights, amount or discount (p between 0.07 and 0.17). Two of these sit just above 0.05, so a small effect could hide in 236 stays, but nothing large does." },
            ],
          },
          { image: { src: hotelAmountDiscount, alt: "Scatter plot of the discount against the amount billed", caption: "Discount (Reduction, €) against amount billed (Montant, €): three levels, none, 5% and 10% (R plot, click to enlarge)" } },
        ],
      },

      /* ---- 4 · the chains ---- */
      {
        eyebrow: "Step 4",
        heading: "Do the four chains attract different guests?",
        blocks: [
          "Now the five labels. Five variables make ten pairs, and I tested each with a chi-square test of independence: it compares the guests counted in each cell with the counts you would expect if the two labels were unrelated.",
          { image: { src: hotelTests, alt: "p-values of the ten chi-square tests", caption: "The ten pairs, from the strongest evidence of a link to the weakest (click to enlarge)" } },
          {
            bullets: [
              { label: "Two of ten pairs are linked, and both involve the chain", text: "purpose of the stay (p = 0.0045) and board type (p = 0.026). Gender (p = 0.98) and booking source (p = 0.36) say nothing about which chain a guest picks." },
              { label: "A caution on multiple tests", text: "ten tests at the 5% level produce half a false alarm on average. Correcting for it (Bonferroni, threshold 0.5%), purpose × chain still holds, just under the line, but board type × chain does not. I treat the second as a lead to confirm, not a result." },
              { label: "A modest strength", text: "the strength of the link (Cramér's V) is 0.23 for purpose × chain and 0.17 for board type × chain: real, but not segments carved in stone." },
              { label: "Booking source is the least reliable test", text: "some expected counts fall below 5 (walk-ins in a single chain), which stretches the chi-square approximation. No pair involving it came close to significance, and a simulated p-value is in the code." },
            ],
          },
        ],
      },
      {
        eyebrow: "Finding",
        heading: "Etophotel leans business, Navotel leans leisure",
        blocks: [
          { image: { src: hotelChains, alt: "Purpose of stay and board type by hotel chain", caption: "Who stays where: purpose of stay (top) and board type (bottom), by chain (click to enlarge)" } },
          {
            bullets: [
              { label: "Purpose", text: "overall 44% of the stays are business. At Etophotel it is 60%, at Navotel 28%. Campanule (39%) and Formule 0 (50%) stay close to the average." },
              { label: "Board type", text: "Navotel guests book room only far more often (38%, against 26% overall), Etophotel guests rarely (12%). Campanule has the most full board (29%, against 15% at Formule 0)." },
            ],
          },
          "To see where each link actually lives, I measured how much each cell contributes to the chi-square. A cell counts when it contributes more than the average cell.",
          { image: { src: hotelContrib, alt: "Observed and expected guests per chain, with each cell's share of the link", caption: "Observed against expected guests, and each cell's share of the link (click to enlarge)" } },
          {
            bullets: [
              { label: "Purpose × chain", text: "four cells carry 89% of the link. Etophotel counts 34 business guests where 25 were expected (+34%) and Navotel only 17 where 27 were expected (-36%). The mirror image holds for leisure: Navotel 43 against 33, Etophotel 23 against 32." },
              { label: "Board type × chain", text: "Etophotel has 7 room-only guests where 15 were expected (30% of the link) and Navotel 23 where 16 were expected (23%). Full board is above expectation at Campanule (15 against 11) and below at Formule 0 (10 against 15)." },
              { label: "Not business in disguise", text: "board type and purpose of the stay are unrelated (p = 0.60), so the board type differences between chains are not simply the business and leisure split again." },
            ],
          },
        ],
      },

      /* ---- conclusions ---- */
      {
        eyebrow: "Conclusions",
        heading: "What I would tell the hotel group",
        blocks: [
          {
            bullets: [
              { label: "Sell the second night", text: "a bill is nights times rate, and 19% of the stays last a single night. Each extra night is worth about 55 € on average: test a two-night offer on single-night guests." },
              { label: "Find what puts a guest on the 73 € rate", text: "revenue per stay depends on it as much as on the length of the stay. Board type is my first suspect, but it is not tested in this dataset." },
              { label: "Review the discount rules", text: "they follow the stay length only weakly and sit at 0, 5 and 10% of the bill. Check that the tiers are applied by rule, and whether they actually make guests stay longer." },
              { label: "Position the chains on purpose", text: "corporate rates and meal packages for Etophotel, family and tourism offers for Navotel, where many guests book room only and a meal plan could be offered. These are hypotheses to test, not findings." },
              { label: "Keep the rest common", text: "gender and booking source do not separate the chains, so those parts of the marketing plan can stay shared." },
            ],
          },
          "What this does not say: it is 236 stays, a single snapshot, and every link here is an association, not a cause. The natural next step is one regression of the bill on nights, chain and board type, to separate their effects.",
        ],
      },

      /* ---- code ---- */
      {
        eyebrow: "Code",
        heading: "R, with the SAS equivalent",
        blocks: [
          "Each block below is the analysis behind one step above, in R and in SAS: use the switch. The file name and separator are assumptions to adjust.",
          "Describing the guests (step 2):",
          { code: { tabs: [{ label: "R", language: "r", source: R_DESCRIBE }, { label: "SAS", language: "sas", source: SAS_DESCRIBE }] } },
          "What drives the bill (step 3):",
          { code: { tabs: [{ label: "R", language: "r", source: R_CORR }, { label: "SAS", language: "sas", source: SAS_CORR }] } },
          "The ten tests, with the correction for multiple tests (step 4):",
          { code: { tabs: [{ label: "R", language: "r", source: R_TESTS }, { label: "SAS", language: "sas", source: SAS_TESTS }] } },
          "Profiles and where the link lives (step 4):",
          { code: { tabs: [{ label: "R", language: "r", source: R_PROFILES }, { label: "SAS", language: "sas", source: SAS_PROFILES }] } },
          "Built with R (base R, stats) and SAS (PROC MEANS, UNIVARIATE, FREQ, CORR, REG, SGPLOT).",
        ],
      },
    ],
  },
];
