import json, re

lines = open('temp_qs.txt', 'r', encoding='utf-8').read().splitlines()
themes = {
    "System Design": [r'\barchitect', r'\bscalabil', r'\bscale\b', r'\bdistributed', r'\btradeoff', r'\bmicroservice', r'\bsystem design', r'\bcap theorem', r'\breplication', r'\bsharding\b', r'\bmonolith\b', r'\bmessage queue\b', r'\bpub/sub\b'],
    "Security": [r'\bsecur', r'\bauth', r'\bencrypt', r'\bowasp', r'\bjwt\b', r'\boauth', r'\binjection', r'\bharden', r'\battack', r'\bvulnerab', r'\bhack', r'\bxss\b', r'\bcsrf\b', r'\bcors\b', r'\bbcrypt', r'\bprivacy', r'\bhashing\b', r'\bssl\b', r'\btls\b'],
    "Databases": [r'\bdatabase', r'\bsql\b', r'\bnosql', r'\bindex', r'\btransaction', r'\bshard', r'\bconsisten', r'\bpostgres', r'\bmysql', r'\bmongo', r'\bredis\b', r'\bacid\b', r'\bnormaliz', r'\bquery', r'\brdbms', r'\bcassandra', r'\btable', r'\brelation\b', r'\borm\b'],
    "Networking": [r'\btcp/?ip\b', r'\btcp\b', r'\bhttp', r'\bdns\b', r'\bload balanc', r'\bcdn\b', r'\bwebsocket', r'\budp\b', r'\brout', r'\bproxy', r'\bbgp\b', r'\bport', r'\bsocket', r'\bnetwork', r'\bping\b', r'\bconnection\b', r'\bpacket\b'],
    "Performance": [r'\blatency', r'\bthroughput', r'\bprofil', r'\bcach', r'\bbottleneck', r'\bmemory leak', r'\boptimiz', r'\bspeed', r'o\([1n]\)', r'\bbig o\b', r'\bcomplexit', r'\bperform', r'\bbenchmark', r'\bslow\b', r'\bfast\b'],
    "Concurrency": [r'\brace condition', r'\block', r'\basync', r'\bdeadlock', r'\bthread', r'\bmutex', r'\bparallel', r'\bsynchroniz', r'\bawait\b', r'\bevent loop', r'\bmultithread', r'\bgoroutin', r'\bconcurren', r'\bworker\b', r'\bprocess\b'],
    "ML/AI": [r'\bmodel', r'\btrain', r'\brag\b', r'\bembedd', r'\binference\b', r'\bmlops', r'\bllm\b', r'\bprompt', r'\btoken', r'\btensor', r'\bpytorch', r'\bopenai', r'\bmachine learning', r'\bai\b', r'\bneural', r'\bdeep learn', r'\bvector\b'],
    "DevOps": [r'\bdevops', r'\bcontainer', r'\bk8s', r'\bci/?cd\b', r'\biac\b', r'\bobservability', r'\bsre\b', r'\bdocker', r'\bkubernetes', r'\bdeploy', r'\bterraform', r'\baws\b', r'\bgcp\b', r'\bazure', r'\bpipeline', r'\bprometheus', r'\bgrafana', r'\bpod\b', r'\bcluster', r'\bcloud\b'],
    "API Design": [r'\bapi\b', r'\brest\b', r'\brestful', r'\bgraphql', r'\bversioning', r'\brate limit', r'\bidempotenc', r'\bwebhook', r'\bpagination', r'\bendpoint', r'\bgrpc\b', r'\bstatus code', r'\bjson\b', r'\bxml\b', r'\bpostman\b'],
    "Debugging": [r'\bdebug', r'\broot cause', r'\blog[sg]?\b', r'\bincident', r'\berror', r'\bexception', r'\bcrash', r'\btroubleshoot', r'\bstack trace', r'\bpostmortem', r'\bfail\b', r'\btrace\b', r'\bissue\b']
}

out = []
counts = {k: 0 for k in themes}
fallback = "System Design"

for i, q in enumerate(lines):
    if not str(q).strip(): continue
    q_lower = q.lower()
    
    best_theme = fallback
    max_matches = 0
    for t_name, patterns in themes.items():
        matches = sum(1 for p in patterns if re.search(p, q_lower))
        if matches > max_matches:
            max_matches = matches
            best_theme = t_name
            
    out.append({"id": i+1, "question": q, "theme": best_theme})
    counts[best_theme] += 1

with open('data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, indent=2)

dist_str = "\n".join([f"  {k}: {v}" for k, v in counts.items()])
msg = f"✓ questions.json: {len(out)} items COMPLETE\n\nTheme distribution:\n{dist_str}\n  TOTAL: {len(out)}"

with open('temp_msg.txt', 'w', encoding='utf-8') as f:
    f.write(msg)
