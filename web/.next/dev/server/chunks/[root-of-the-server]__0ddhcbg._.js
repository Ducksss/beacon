module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Dev/beacon/web/src/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseAdmin",
    ()=>getSupabaseAdmin,
    "isSupabaseConfigured",
    ()=>isSupabaseConfigured,
    "tryGetSupabaseAdmin",
    ()=>tryGetSupabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Dev/beacon/web/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
;
let supabaseAdmin = null;
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function isSupabaseConfigured() {
    return Boolean(("TURBOPACK compile-time value", "https://jshjridxukcooepqfyjd.supabase.co") && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
function getSupabaseAdmin() {
    if (supabaseAdmin) {
        return supabaseAdmin;
    }
    const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseServiceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
    supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            persistSession: false
        }
    });
    return supabaseAdmin;
}
function tryGetSupabaseAdmin() {
    if (!isSupabaseConfigured()) {
        return null;
    }
    return getSupabaseAdmin();
}
}),
"[project]/Dev/beacon/web/src/lib/supabase-errors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isMissingTableError",
    ()=>isMissingTableError,
    "missingSchemaMessage",
    ()=>missingSchemaMessage
]);
function asSupabaseError(error) {
    if (!error || typeof error !== 'object') {
        return {};
    }
    return error;
}
function isMissingTableError(error) {
    const supabaseError = asSupabaseError(error);
    return supabaseError.code === 'PGRST205';
}
function missingSchemaMessage() {
    return 'Database schema is not initialized. Run web/supabase/schema.sql in your Supabase SQL editor.';
}
}),
"[project]/Dev/beacon/web/src/app/api/dashboard/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/beacon/web/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/beacon/web/src/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$src$2f$lib$2f$supabase$2d$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Dev/beacon/web/src/lib/supabase-errors.ts [app-route] (ecmascript)");
;
;
;
async function GET() {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["tryGetSupabaseAdmin"])();
        if (!supabase) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                stats: {
                    activeHouses: 0,
                    studentsReached: 0,
                    recentPollResponses: 0
                },
                activeHouses: [],
                recentBroadcasts: [],
                pollSummaries: [],
                warning: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
            });
        }
        const [{ data: houses, error: housesError }, { data: broadcasts, error: broadcastsError }, { data: votesByUser, error: votesByUserError }, { count: totalResponses, error: totalResponsesError }] = await Promise.all([
            supabase.from('houses').select('chat_id,title,status').eq('status', 'active').order('title', {
                ascending: true
            }),
            supabase.from('broadcasts').select('id,content,media_url,created_at').order('created_at', {
                ascending: false
            }).limit(10),
            supabase.from('votes').select('user_id'),
            supabase.from('votes').select('*', {
                count: 'exact',
                head: true
            })
        ]);
        if (housesError) throw housesError;
        if (broadcastsError) throw broadcastsError;
        if (votesByUserError) throw votesByUserError;
        if (totalResponsesError) throw totalResponsesError;
        const broadcastRows = broadcasts ?? [];
        const broadcastIds = broadcastRows.map((item)=>item.id);
        const { data: polls, error: pollsError } = broadcastIds.length ? await supabase.from('polls').select('id,broadcast_id,question,created_at').in('broadcast_id', broadcastIds).order('created_at', {
            ascending: false
        }) : {
            data: [],
            error: null
        };
        if (pollsError) throw pollsError;
        const pollRows = polls ?? [];
        const pollByBroadcastId = new Map(pollRows.map((poll)=>[
                poll.broadcast_id,
                poll
            ]));
        const recentBroadcasts = broadcastRows.map((item)=>({
                id: item.id,
                content: item.content || 'Untitled broadcast',
                mediaUrl: item.media_url,
                createdAt: item.created_at,
                type: pollByBroadcastId.has(item.id) ? 'Poll' : 'Announcement'
            }));
        const pollSummaries = await Promise.all(pollRows.slice(0, 5).map(async (poll)=>{
            const [{ data: options, error: optionsError }, { data: telegramPolls, error: telegramPollsError }] = await Promise.all([
                supabase.from('poll_options').select('option_index,text').eq('poll_id', poll.id).order('option_index', {
                    ascending: true
                }),
                supabase.from('telegram_polls').select('telegram_poll_id').eq('master_poll_id', poll.id)
            ]);
            if (optionsError) throw optionsError;
            if (telegramPollsError) throw telegramPollsError;
            const telegramPollIds = (telegramPolls ?? []).map((item)=>item.telegram_poll_id);
            const { data: votes, error: votesError } = telegramPollIds.length ? await supabase.from('votes').select('option_index').in('telegram_poll_id', telegramPollIds) : {
                data: [],
                error: null
            };
            if (votesError) throw votesError;
            const counts = new Map();
            for (const vote of votes ?? []){
                counts.set(vote.option_index, (counts.get(vote.option_index) ?? 0) + 1);
            }
            const optionsWithVotes = (options ?? []).map((option)=>({
                    optionIndex: option.option_index,
                    text: option.text,
                    votes: counts.get(option.option_index) ?? 0
                }));
            const leading = [
                ...optionsWithVotes
            ].sort((a, b)=>b.votes - a.votes)[0];
            return {
                pollId: poll.id,
                question: poll.question,
                totalVotes: optionsWithVotes.reduce((sum, option)=>sum + option.votes, 0),
                leadingOption: leading ? {
                    text: leading.text,
                    votes: leading.votes
                } : null,
                options: optionsWithVotes
            };
        }));
        const uniqueVoters = new Set((votesByUser ?? []).map((row)=>String(row.user_id))).size;
        return __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            stats: {
                activeHouses: (houses ?? []).length,
                studentsReached: uniqueVoters,
                recentPollResponses: totalResponses ?? 0
            },
            activeHouses: houses ?? [],
            recentBroadcasts,
            pollSummaries
        });
    } catch (error) {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$src$2f$lib$2f$supabase$2d$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isMissingTableError"])(error)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                stats: {
                    activeHouses: 0,
                    studentsReached: 0,
                    recentPollResponses: 0
                },
                activeHouses: [],
                recentBroadcasts: [],
                pollSummaries: [],
                warning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$src$2f$lib$2f$supabase$2d$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["missingSchemaMessage"])()
            });
        }
        console.error('Failed to build dashboard data:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Dev$2f$beacon$2f$web$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to load dashboard data'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ddhcbg._.js.map