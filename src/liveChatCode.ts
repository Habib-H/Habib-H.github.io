/*
 * Code shown in the "4-week live chat analysis" panel (see details.ts).
 * - LIVE_CHAT_M and LIVE_CHAT_PYTHON are the same logic in two languages (the panel has a switch).
 * - The DAX measures carry plain-language comments for non-technical readers.
 */

/** Power Query (M): from the engagement log to one row per chat. */
export const LIVE_CHAT_M = String.raw`let
    // 1. LOAD: read the sheet and use the first row as column names
    Source = Excel.Workbook(File.Contents("C:\path\to\Data Set.xlsx"), null, true),
    RawSheet = Source{[Item = "Chat engagements for ops https ", Kind = "Sheet"]}[Data],
    PromotedHeaders = Table.PromoteHeaders(RawSheet, [PromoteAllScalars = true]),
    ChangedType = Table.TransformColumnTypes(
        PromotedHeaders,
        {
            {"Ticket ID", Int64.Type},
            {"Agent Name Region Simple", type text},
            {"Chat language", type text},
            {"Engagement assignment", type text},
            {"Chat started - Timestamp", type datetime},
            {"Engagement - Timestamp", type datetime},
            {"Chat updated - Timestamp", type datetime},
            {"Engagements", Int64.Type}
        }
    ),

    // 2. ONE ROW PER CHAT: group the engagement rows by Ticket ID
    Grouped = Table.Group(
        ChangedType,
        {"Ticket ID"},
        {
            // identical on every row of a chat, so the minimum is simply the value
            {"Chat Started TS", each List.Min(_[#"Chat started - Timestamp"]), type nullable datetime},
            {"Chat Last Update TS", each List.Min(_[#"Chat updated - Timestamp"]), type nullable datetime},
            {"Chat language", each List.Min(_[Chat language]), type nullable text},
            // when the bot greeted the customer (kept as a column, the bot rows are not)
            {"Bot Greeting TS",
                each List.Min(
                    Table.SelectRows(
                        _,
                        each [Agent Name Region Simple] = "Chat Bot User"
                            and [Engagement assignment] = "Self-assigned"
                    )[#"Engagement - Timestamp"]
                ),
                type nullable datetime
            },
            // first time a contact center (bot excluded) really took the chat
            {"First Response TS",
                each List.Min(
                    Table.SelectRows(
                        _,
                        each [Agent Name Region Simple] <> "Chat Bot User"
                            and ([Engagement assignment] = "Assignment Accepted"
                                 or [Engagement assignment] = "Self-assigned")
                    )[#"Engagement - Timestamp"]
                ),
                type nullable datetime
            },
            // missed hand-overs are removed from the rows but counted here
            {"Missed Assignment Count",
                each Table.RowCount(
                    Table.SelectRows(_, each [Engagement assignment] = "Assignment Missed")
                ),
                Int64.Type
            },
            // helper: the contact centers that actually engaged (collapsed in the next step)
            {"RegionsTouched",
                each List.Distinct(
                    Table.SelectRows(
                        _,
                        each [Agent Name Region Simple] <> "Chat Bot User"
                            and ([Engagement assignment] = "Assignment Accepted"
                                 or [Engagement assignment] = "Self-assigned")
                    )[Agent Name Region Simple]
                ),
                type list
            }
        }
    ),

    // 3. CONTACT CENTER: "CCW", "PCC", "CCW & PCC" or "Only Chat Bot"
    AddRegionField = Table.AddColumn(
        Grouped,
        "Agent Name Region Simple",
        each
            let
                Regions = List.Sort([RegionsTouched])
            in
                if List.Count(Regions) = 0 then "Only Chat Bot"
                else Text.Combine(Regions, " & "),
        type text
    ),

    // 4. CLEAN-UP: strip the "CS T1 " prefix from the language, drop the helper, order the columns
    CleanLanguage = Table.TransformColumns(
        AddRegionField,
        {{"Chat language", each Text.Replace(_, "CS T1 ", ""), type text}}
    ),
    RemoveHelper = Table.RemoveColumns(CleanLanguage, {"RegionsTouched"}),
    Reordered = Table.ReorderColumns(
        RemoveHelper,
        {
            "Ticket ID",
            "Agent Name Region Simple",
            "Chat language",
            "Chat Started TS",
            "Bot Greeting TS",
            "First Response TS",
            "Chat Last Update TS",
            "Missed Assignment Count"
        }
    ),
    TypedResult = Table.TransformColumnTypes(
        Reordered,
        {
            {"Ticket ID", Int64.Type},
            {"Agent Name Region Simple", type text},
            {"Chat language", type text},
            {"Chat Started TS", type datetime},
            {"Bot Greeting TS", type datetime},
            {"First Response TS", type datetime},
            {"Chat Last Update TS", type datetime},
            {"Missed Assignment Count", Int64.Type}
        }
    )
in
    TypedResult`;

/** Python (pandas): same logic, plus the two response metrics. */
export const LIVE_CHAT_PYTHON = `import pandas as pd

BOT = "Chat Bot User"
ENGAGED = ["Assignment Accepted", "Self-assigned"]   # a contact center really took the chat

# 1. LOAD
raw = pd.read_excel("Data Set.xlsx", sheet_name=0)
for col in ["Chat started - Timestamp", "Engagement - Timestamp", "Chat updated - Timestamp"]:
    raw[col] = pd.to_datetime(raw[col])

# Rows where a contact center (not the bot) really engaged, and the bot's own greeting rows
human = raw[(raw["Agent Name Region Simple"] != BOT) & raw["Engagement assignment"].isin(ENGAGED)]
bot = raw[(raw["Agent Name Region Simple"] == BOT) & (raw["Engagement assignment"] == "Self-assigned")]

# 2. ONE ROW PER CHAT: these three fields are identical on every row of a chat
tickets = raw.groupby("Ticket ID").agg(
    **{
        "Chat Started TS": ("Chat started - Timestamp", "min"),
        "Chat Last Update TS": ("Chat updated - Timestamp", "min"),
        "Chat language": ("Chat language", "min"),
    }
)

# Keep the information of the removed rows in new columns
tickets["Bot Greeting TS"] = bot.groupby("Ticket ID")["Engagement - Timestamp"].min()
tickets["First Response TS"] = human.groupby("Ticket ID")["Engagement - Timestamp"].min()
tickets["Missed Assignment Count"] = (
    raw["Engagement assignment"].eq("Assignment Missed").groupby(raw["Ticket ID"]).sum()
)

# 3. CONTACT CENTER: "CCW", "PCC", "CCW & PCC" or "Only Chat Bot"
tickets["Agent Name Region Simple"] = (
    human.groupby("Ticket ID")["Agent Name Region Simple"]
    .agg(lambda s: " & ".join(sorted(set(s))))
    .reindex(tickets.index)
    .fillna("Only Chat Bot")
)

# 4. CLEAN-UP: "CS T1 EN" -> "EN", order the columns
tickets["Chat language"] = tickets["Chat language"].str.replace("CS T1 ", "", regex=False)
tickets = tickets.reset_index()[
    ["Ticket ID", "Agent Name Region Simple", "Chat language", "Chat Started TS",
     "Bot Greeting TS", "First Response TS", "Chat Last Update TS", "Missed Assignment Count"]
]

# 5. RESPONSE METRICS, in minutes (like DATEDIFF(MINUTE): seconds are dropped first)
minute = lambda s: s.dt.floor("min")
tickets["FRT"] = (minute(tickets["First Response TS"]) - minute(tickets["Chat Started TS"])).dt.total_seconds() / 60
tickets["AHT (min)"] = (minute(tickets["Chat Last Update TS"]) - minute(tickets["First Response TS"])).dt.total_seconds() / 60`;

/** DAX: how many full-time agents are needed for the chats on screen. */
export const DAX_REQUIRED_FTE = `Required_FTE_Adaptive =
-- WHAT IT ANSWERS: "How many full-time agents do we need to handle the chats on screen?"
-- It adapts to the chart (a week, a day, an hour...) and reacts to the 4 sliders of the page.

-- 1. THE 4 ASSUMPTIONS, set with the sliders (base value after each //)
VAR _TargetConcurrency = Concurrency[Valeur Concurrency] // 2: chats one agent handles at the same time
VAR _TargetOccupancy = Occupancy[Valeur Occupancy] // 0.85: share of available time really spent on chats
VAR _TotalShrinkage = 'Total Shrinkage'[Valeur Total Shrinkage] // 0.28: time lost to breaks, holidays, training...
VAR _HoursPerFTEContract = 'Hours Per FTE Contract'[Valeur Hours Per FTE Contract] // 40: contract hours per week

-- 2. THE WORKLOAD: total hours of conversation in the period shown
-- Each chat counts for its handle time (AHT) converted to hours.
-- Outliers (chats left open for days) and chats handled by the bot alone are left out.
-- SUMX adds up chat by chat, so English and non-English chats mix naturally.
VAR _WorkloadHoursInContext =
    SUMX(
        FILTER(
            'Chat engagements for ops https',
            NOT 'Chat engagements for ops https'[Is Outlier]
                && 'Chat engagements for ops https'[Agent Name Region Simple] <> "Only Chat Bot"
        ),
        DIVIDE('Chat engagements for ops https'[AHT (min)], 60)
    )

-- 3. THE LENGTH OF THE PERIOD SHOWN (the chart can zoom from weeks down to half-hours)
VAR _FirstDate = MIN('Chat engagements for ops https'[Chat Started Date])
VAR _LastDate = MAX('Chat engagements for ops https'[Chat Started Date])
-- DATEDIFF returns the boundary difference; +1 gives the number of days, both ends included
VAR _DaysInPeriod = DATEDIFF(_FirstDate, _LastDate, DAY) + 1
-- Days converted to weeks (7 days = 1 week, 1 day = 0.14 week)
VAR _WeeksInPeriod = DIVIDE(_DaysInPeriod, 7)

-- 4. WHAT ONE FTE CAN REALLY DELIVER IN THAT PERIOD
-- A 40-hour contract gives 40 hours over 7 days, or about 5.7 hours over 1 day,
-- minus the shrinkage (breaks, holidays, training...)
VAR _AdjustedContractHours = _HoursPerFTEContract * _WeeksInPeriod
VAR _NetHoursPerFTE = _AdjustedContractHours * (1 - _TotalShrinkage)

-- 5. REQUIRED FTE
-- Agents work on several chats at once and are never busy 100% of the time,
-- so staffed hours needed = workload / (concurrency x occupancy)
VAR _StaffedHoursNeeded = DIVIDE(_WorkloadHoursInContext, (_TargetConcurrency * _TargetOccupancy))
-- Required FTE = staffed hours needed / net hours that one FTE delivers
VAR _FinalFTE = DIVIDE(_StaffedHoursNeeded, _NetHoursPerFTE)
RETURN
    IF(ISBLANK(_FinalFTE), 0, _FinalFTE)`;

/** DAX: the donut "Above / Below target", recomputed whenever the SLA slider moves. */
export const DAX_FRT_DONUT = `-- FRT = minutes between the start of the chat and the first answer of a contact center
-- (whole minutes: 16:19:32 -> 16:24:37 counts as 5)
FRT =
DATEDIFF(
    'Chat engagements for ops https'[Chat Started TS],
    'Chat engagements for ops https'[First Response TS],
    MINUTE
)

-- Feeds the donut "Chats handled by humans": two slices, "Above Target" and "Below Target".
-- Move the FRT SLA slider and both slices are recounted instantly.
Dynamic Pie Volumes =
-- which slice is being drawn
VAR SelectedStatus = SELECTEDVALUE('Target_Status'[Status])
-- the target in minutes, set with the slider (6 in the report)
VAR TargetThreshold = [Valeur FRT SLA Target (in minutes)]
RETURN
    SWITCH(
        SelectedStatus,
        -- slice 1: chats whose first answer took the target time or longer
        "Above Target",
            CALCULATE(
                DISTINCTCOUNT('Chat engagements for ops https'[Ticket ID]),
                FILTER(
                    VALUES('Chat engagements for ops https'[Ticket ID]),
                    CALCULATE(MAX('Chat engagements for ops https'[FRT])) >= TargetThreshold
                )
            ),
        -- slice 2: chats answered faster than the target
        "Below Target",
            CALCULATE(
                DISTINCTCOUNT('Chat engagements for ops https'[Ticket ID]),
                FILTER(
                    VALUES('Chat engagements for ops https'[Ticket ID]),
                    CALCULATE(MAX('Chat engagements for ops https'[FRT])) < TargetThreshold
                )
            ),
        -- no slice selected: all the chats
        DISTINCTCOUNT('Chat engagements for ops https'[Ticket ID])
    )`;

/** DAX: handle time of a chat. */
export const DAX_AHT = `-- AHT (min) = how long a chat kept an agent busy.
-- From the first answer of a contact center to the last message of the chat.
-- Whole minutes: 16:24:37 -> 17:47:16 counts as 83.
AHT (min) =
DATEDIFF(
    'Chat engagements for ops https'[First Response TS],
    'Chat engagements for ops https'[Chat Last Update TS],
    MINUTE
)`;

/** DAX: histogram of the first response time, with the cumulative curve. */
export const DAX_FRT_HISTOGRAM = `-- A small table with one row per minute of waiting: 0, 1, 2 ... 29, and 30 for "30 or more".
-- It is not linked to the data: the measures below read the bin they are drawn in.
FRT Bin =
SELECTCOLUMNS(
    GENERATESERIES(0, 30, 1),
    "Bin", [Value],
    "Label", IF([Value] = 30, "30+", FORMAT([Value], "0"))
)

-- The bars: chats whose first answer took exactly this many minutes (last bar: 30 or more)
Chats in Bin =
VAR b = SELECTEDVALUE('FRT Bin'[Bin])
RETURN
CALCULATE(
    COUNTROWS('Chat engagements for ops https'),
    FILTER(
        'Chat engagements for ops https',
        NOT ISBLANK('Chat engagements for ops https'[FRT]) &&
        ((b < 30 && 'Chat engagements for ops https'[FRT] = b)
            || (b = 30 && 'Chat engagements for ops https'[FRT] >= 30))
    )
)

-- The line: share of chats answered in this many minutes or fewer.
-- Read it at any minute to get the SLA for that target.
FRT Cumulative % =
VAR b = SELECTEDVALUE('FRT Bin'[Bin])
VAR LastBin = CALCULATE(MAX('FRT Bin'[Bin]), ALL('FRT Bin'))
VAR Total =
    CALCULATE(
        COUNTROWS('Chat engagements for ops https'),
        NOT ISBLANK('Chat engagements for ops https'[FRT])
    )
VAR UpTo =
    CALCULATE(
        COUNTROWS('Chat engagements for ops https'),
        FILTER(
            'Chat engagements for ops https',
            NOT ISBLANK('Chat engagements for ops https'[FRT]) &&
            'Chat engagements for ops https'[FRT] <= b
        )
    )
-- the last bar closes the curve at 100%
RETURN IF(b = LastBin, 1, DIVIDE(UpTo, Total))`;

/** DAX: handle time against the target of each language group. */
export const DAX_AHT_INDEX = `-- Two language groups, two targets: 10 minutes for English, 12 for the others.
Language Group =
IF('Chat engagements for ops https'[Chat language] = "English", "English", "Non English")

AHT Target =
IF('Chat engagements for ops https'[Language Group] = "English", 10, 12)

-- The median ignores the chats left open for days, so no cut-off is needed here
AHT Median = MEDIAN('Chat engagements for ops https'[AHT (min)])

-- 100% = on target. Dividing each group by its own target lets one line serve both groups.
AHT Index =
DIVIDE(
    [AHT Median],
    AVERAGE('Chat engagements for ops https'[AHT Target])
)`;
