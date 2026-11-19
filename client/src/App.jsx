
import { useEffect, useState } from 'react';
import {
    Link,
    Navigate,
    NavLink,
    Route,
    Routes,
    useNavigate
} from 'react-router-dom';
import api from './api';

function App() {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('ss_user'));
        } catch {
            return null;
        }
    });

    const nav = useNavigate();

    function logout() {
        localStorage.removeItem('ss_token');
        localStorage.removeItem('ss_user');
        setUser(null);
        nav('/login');
    }

    return (
        <div className="app">
            {user && (
                <header>
                    <Link className="logo" to="/">
                        Skill<span>Swap</span>
                        <small>LEARN • TEACH • REPEAT</small>
                    </Link>

                    <nav>
                        <NavLink to="/">Dashboard</NavLink>
                        <NavLink to="/skills">My Skills</NavLink>
                        <NavLink to="/matches">Matches</NavLink>
                        <NavLink to="/requests">Requests</NavLink>
                        <NavLink to="/sessions">Sessions</NavLink>
                    </nav>

                    <button className="quiet" onClick={logout}>
                        Log out
                    </button>
                </header>
            )}

            <Routes>
                <Route
                    path="/login"
                    element={
                        user ? <Navigate to="/" /> :
                            <Auth
                                mode="login"
                                onAuth={u => {
                                    setUser(u);
                                    nav('/');
                                }}
                            />
                    }
                />

                <Route
                    path="/register"
                    element={
                        user ? <Navigate to="/" /> :
                            <Auth
                                mode="register"
                                onAuth={u => {
                                    setUser(u);
                                    nav('/');
                                }}
                            />
                    }
                />

                <Route
                    path="/reset-password"
                    element={user ? <Navigate to="/" /> : <ResetPassword />}
                />

                <Route
                    path="/"
                    element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
                />

                <Route
                    path="/skills"
                    element={user ? <Skills /> : <Navigate to="/login" />}
                />

                <Route
                    path="/matches"
                    element={user ? <Matches /> : <Navigate to="/login" />}
                />

                <Route
                    path="/requests"
                    element={user ? <Requests user={user} /> : <Navigate to="/login" />}
                />

                <Route
                    path="/sessions"
                    element={user ? <Sessions user={user} /> : <Navigate to="/login" />}
                />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

function Auth({ mode, onAuth }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);
    const reg = mode === 'register';

    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setErr('');

        try {
            if (reg) {
                await api.post('/auth/register', form);
            }

            const { data } = await api.post('/auth/login', {
                email: form.email,
                password: form.password
            });

            localStorage.setItem('ss_token', data.token);
            localStorage.setItem('ss_user', JSON.stringify(data.user));
            onAuth(data.user);
        } catch (e) {
            setErr(
                e.response?.data?.message ||
                'Could not connect. Check server and database.'
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="auth">
            <section className="auth-side">
                <div className="logo">
                    Skill<span>Swap</span>
                </div>
                <p className="eyebrow">SHARE WHAT YOU KNOW</p>
                <h1>
                    Your skills are<br />
                    <em>worth sharing.</em>
                </h1>
                <p>
                    Learn something new by teaching what you already know.
                    No money. Just people helping people.
                </p>
                <div className="chips">
                    <span>✦ Peer learning</span>
                    <span>↔ Skill exchange</span>
                </div>
            </section>

            <section className="auth-box">
                <p className="eyebrow">
                    {reg ? 'YOUR NEXT CHAPTER STARTS HERE' : 'GOOD TO HAVE YOU BACK'}
                </p>
                <h2>{reg ? 'Create your account' : 'Welcome back'}</h2>
                <p className="muted">
                    {reg
                        ? 'Join students who love to share.'
                        : 'Your next skill swap is waiting.'}
                </p>

                {err && <p className="error">{err}</p>}

                <form onSubmit={submit}>
                    {reg && (
                        <label>
                            Full name
                            <input
                                required
                                value={form.name}
                                onChange={e =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                placeholder="Ravi Kumar"
                            />
                        </label>
                    )}

                    <label>
                        Email address
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={e =>
                                setForm({ ...form, email: e.target.value })
                            }
                            placeholder="you@example.com"
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            minLength={6}
                            required
                            value={form.password}
                            onChange={e =>
                                setForm({ ...form, password: e.target.value })
                            }
                            placeholder="At least 6 characters"
                        />
                    </label>

                    <button className="primary wide" disabled={busy}>
                        {busy
                            ? 'Please wait…'
                            : reg
                                ? 'Create account →'
                                : 'Log in →'}
                    </button>
                </form>

                {!reg && (
                    <p className="switch">
                        <Link to="/reset-password">Forgot password?</Link>
                    </p>
                )}

                <p className="switch">
                    {reg ? 'Already have an account?' : 'New to SkillSwap?'}{' '}
                    <Link to={reg ? '/login' : '/register'}>
                        {reg ? 'Log in' : 'Create an account'}
                    </Link>
                </p>
            </section>
        </main>
    );
}

function ResetPassword() {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setErr('');
        setMsg('');
        setBusy(true);

        try {
            const { data } = await api.post('/auth/reset-password', {
                email,
                newPassword
            });

            setMsg(data.message);
            setNewPassword('');
        } catch (e) {
            setErr(
                e.response?.data?.message ||
                'Could not reset password. Check the server.'
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="auth">
            <section className="auth-side">
                <div className="logo">
                    Skill<span>Swap</span>
                </div>
                <p className="eyebrow">ACCOUNT RECOVERY</p>
                <h1>
                    A fresh start,<br />
                    <em>one step away.</em>
                </h1>
                <p>Reset your password and get back to learning.</p>
            </section>

            <section className="auth-box">
                <p className="eyebrow">RESET YOUR PASSWORD</p>
                <h2>Forgot password?</h2>
                <p className="muted">
                    Enter your registered email and choose a new password.
                </p>

                {err && <p className="error">{err}</p>}
                {msg && <p className="success">{msg}</p>}

                <form onSubmit={submit}>
                    <label>
                        Registered email
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </label>

                    <label>
                        New password
                        <input
                            type="password"
                            minLength={6}
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                        />
                    </label>

                    <button className="primary wide" disabled={busy}>
                        {busy ? 'Please wait…' : 'Reset password →'}
                    </button>
                </form>

                <p className="switch">
                    Remembered it? <Link to="/login">Back to login</Link>
                </p>
            </section>
        </main>
    );
}

function Dashboard({ user }) {
    return (
        <main className="page">
            <section className="hero">
                <p className="eyebrow">YOUR LEARNING COMMUNITY</p>
                <h1>
                    Hey {user.name.split(' ')[0]},<br />
                    <em>what will you learn today?</em>
                </h1>
                <p>
                    Share what you know. Discover what others can teach.
                    Great things happen when skills are shared.
                </p>
                <Link className="light" to="/skills">
                    Set up your skills →
                </Link>
                <div className="orb">
                    S<span>↔</span>
                </div>
            </section>

            <div className="heading">
                <div>
                    <p className="eyebrow">GET STARTED</p>
                    <h2>Your next steps</h2>
                </div>
            </div>

            <div className="cards">
                <Action
                    n="01"
                    title="Tell us your skills"
                    copy="Add what you can teach and what you want to learn."
                    to="/skills"
                />
                <Action
                    n="02"
                    title="Find your people"
                    copy="Discover students whose skills complement yours."
                    to="/matches"
                />
                <Action
                    n="03"
                    title="Make it happen"
                    copy="Send a request and plan a learning session."
                    to="/requests"
                />
            </div>

            <footer>
                SkillSwap <span>Made for curious minds.</span>
            </footer>
        </main>
    );
}

function Action({ n, title, copy, to }) {
    return (
        <article className="card">
            <small>{n} / STEP</small>
            <h3>{title}</h3>
            <p>{copy}</p>
            <Link to={to}>Explore →</Link>
        </article>
    );
}

function Skills() {
    const [all, setAll] = useState([]);
    const [mine, setMine] = useState([]);
    const [sid, setSid] = useState('');
    const [type, setType] = useState('teach');
    const [level, setLevel] = useState('beginner');
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    async function load() {
        const [a, b] = await Promise.all([
            api.get('/skills'),
            api.get('/users/me/skills')
        ]);

        setAll(a.data);
        setMine(b.data);

        if (!sid && a.data.length) {
            setSid(String(a.data[0].id));
        }
    }

    useEffect(() => {
        load().catch(() =>
            setErr('Could not load skills. Check database setup.')
        );
    }, []);

    async function add(e) {
        e.preventDefault();
        setMsg('');
        setErr('');

        try {
            await api.post('/users/me/skills', {
                skill_id: Number(sid),
                type,
                level
            });

            setMsg('Skill added!');
            await load();
        } catch (e) {
            setErr(e.response?.data?.message || 'Could not add skill');
        }
    }

    async function remove(id) {
        try {
            await api.delete('/users/me/skills/' + id);
            setMine(m => m.filter(x => x.id !== id));
        } catch (e) {
            setErr(e.response?.data?.message || 'Could not remove skill');
        }
    }

    return (
        <main className="page">
            <PageTitle
                eyebrow="YOUR PERSONAL TOOLKIT"
                title="My skills"
                subtitle="Everyone has something to share — and something new to discover."
            />

            {msg && <p className="success">{msg}</p>}
            {err && <p className="error">{err}</p>}

            <form className="panel addform" onSubmit={add}>
                <div>
                    <p className="eyebrow">ADD A SKILL</p>
                    <h3>Build your skill profile</h3>
                </div>

                <label>
                    Skill
                    <select
                        value={sid}
                        onChange={e => setSid(e.target.value)}
                        required
                    >
                        {all.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    I'm here to
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                    >
                        <option value="teach">Teach this</option>
                        <option value="learn">Learn this</option>
                    </select>
                </label>

                <label>
                    Level
                    <select
                        value={level}
                        onChange={e => setLevel(e.target.value)}
                    >
                        <option value="beginner">beginner</option>
                        <option value="intermediate">intermediate</option>
                        <option value="advanced">advanced</option>
                    </select>
                </label>

                <button className="primary">+ Add skill</button>
            </form>

            <div className="skillcols">
                <SkillList title="I can teach" type="teach" mine={mine} remove={remove} />
                <SkillList title="I want to learn" type="learn" mine={mine} remove={remove} />
            </div>

            <footer>
                SkillSwap <span>One skill can open a new door.</span>
            </footer>
        </main>
    );
}

function SkillList({ title, type, mine, remove }) {
    const items = mine.filter(x => x.type === type);

    return (
        <section className="panel">
            <h3>
                {title} <span className="count">{items.length}</span>
            </h3>

            {items.length === 0 ? (
                <p className="muted">No skills added yet.</p>
            ) : (
                items.map(s => (
                    <div className="skillrow" key={s.id}>
                        <div>
                            <b>{s.name}</b>
                            <small>{s.level}</small>
                        </div>
                        <button
                            className="x"
                            type="button"
                            onClick={() => remove(s.id)}
                        >
                            ×
                        </button>
                    </div>
                ))
            )}
        </section>
    );
}

function Matches() {
    const [m, setM] = useState([]);
    const [mine, setMine] = useState([]);
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');

    async function load() {
        const [a, b] = await Promise.all([
            api.get('/matches'),
            api.get('/users/me/skills')
        ]);

        setM(a.data);
        setMine(b.data);
    }

    useEffect(() => {
        load().catch(e => {
            console.error(
                'Matches loading failed:',
                e.response?.status,
                e.response?.data || e.message
            );
            setErr(
                e.response?.data?.message ||
                'Could not load matches. Check the browser console (F12).'
            );
        });
    }, []);

    async function send(x) {
        try {
            const teach = mine.find(
                s => s.type === 'teach' && s.name === x.you_teach
            );

            const learn = mine.find(
                s => s.type === 'learn' && s.name === x.they_teach
            );

            if (!teach || !learn) {
                setErr('Add both matching skills to your profile first.');
                return;
            }

            await api.post('/requests', {
                receiver_id: x.user_id,
                teach_skill_id: teach.skill_id,
                learn_skill_id: learn.skill_id
            });

            setMsg('Swap request sent to ' + x.name + '!');
            setErr('');
        } catch (e) {
            setErr(e.response?.data?.message || 'Could not send request.');
        }
    }

    return (
        <main className="page">
            <PageTitle
                eyebrow="GOOD THINGS HAPPEN IN PAIRS"
                title="Your matches."
                subtitle="People who can teach what you want to learn — and want to learn what you can teach."
            />

            {err && <p className="error">{err}</p>}
            {msg && <p className="success">{msg}</p>}

            {!m.length ? (
                <Empty
                    title="Your next learning partner is out there."
                    copy="Add skills to both lists, then check back for reciprocal matches."
                />
            ) : (
                <div className="cards">
                    {m.map(x => (
                        <article
                            className="panel"
                            key={x.user_id + '-' + x.they_teach + '-' + x.you_teach}
                        >
                            <span className="matchlabel">✦ TWO-WAY MATCH</span>
                            <h3>{x.name}</h3>
                            <p className="muted">
                                {x.bio || 'A fellow student ready to share and learn.'}
                            </p>

                            <div className="exchange">
                                <div>
                                    <small>THEY TEACH YOU</small>
                                    <b>{x.they_teach}</b>
                                </div>
                                <span>↔</span>
                                <div>
                                    <small>YOU TEACH THEM</small>
                                    <b>{x.you_teach}</b>
                                </div>
                            </div>

                            <button className="primary wide" onClick={() => send(x)}>
                                Request a swap →
                            </button>
                        </article>
                    ))}
                </div>
            )}

            <footer>
                SkillSwap <span>Better together.</span>
            </footer>
        </main>
    );
}

function Requests({ user }) {
    const [items, setItems] = useState([]);
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');

    async function load() {
        const { data } = await api.get('/requests');
        setItems(data);
    }

    useEffect(() => {
        load().catch(() => setErr('Could not load requests.'));
    }, []);

    async function update(id, status) {
        setErr('');

        try {
            await api.patch('/requests/' + id, { status });
            setMsg('Request ' + status + '.');
            await load();
        } catch (e) {
            setErr(e.response?.data?.message || 'Could not update request.');
        }
    }

    return (
        <main className="page">
            <PageTitle
                eyebrow="LET'S MAKE A CONNECTION"
                title="Swap requests."
                subtitle="Every great exchange starts with a hello."
            />

            {err && <p className="error">{err}</p>}
            {msg && <p className="success">{msg}</p>}

            {!items.length ? (
                <Empty
                    title="No requests just yet"
                    copy="Find a match you like and send a swap request."
                />
            ) : (
                <div className="list">
                    {items.map(r => {
                        const incoming = Number(r.receiver_id) === Number(user.id);

                        return (
                            <article className="panel req" key={r.id}>
                                <div className="avatar">
                                    {(incoming ? r.sender_name : r.receiver_name)[0]}
                                </div>

                                <div className="reqmain">
                                    <small>
                                        {incoming ? 'INCOMING REQUEST' : 'YOU SENT A REQUEST'}
                                    </small>
                                    <h3>{incoming ? r.sender_name : r.receiver_name}</h3>
                                    <p>{r.teach_skill} ↔ {r.learn_skill}</p>
                                    <span className={'status ' + r.status}>{r.status}</span>
                                </div>

                                {incoming && r.status === 'pending' ? (
                                    <div className="reqbuttons">
                                        <button
                                            className="primary"
                                            onClick={() => update(r.id, 'accepted')}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="quiet"
                                            onClick={() => update(r.id, 'rejected')}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                ) : (
                                    <span className="muted">
                    {incoming ? 'Your response' : 'Waiting for response'}
                  </span>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            <footer>
                SkillSwap <span>Good things grow when shared.</span>
            </footer>
        </main>
    );
}

function Sessions({ user }) {
    const [items, setItems] = useState([]);
    const [requests, setRequests] = useState([]);
    const [form, setForm] = useState({
        request_id: '',
        scheduled_at: '',
        mode: 'online',
        link_or_place: ''
    });
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');

    async function load() {
        const [a, b] = await Promise.all([
            api.get('/sessions'),
            api.get('/requests')
        ]);

        setItems(a.data);
        setRequests(b.data.filter(x => x.status === 'accepted'));
    }

    useEffect(() => {
        load().catch(() => setErr('Could not load sessions.'));
    }, []);

    async function schedule(e) {
        e.preventDefault();
        setErr('');
        setMsg('');

        try {
            await api.post('/sessions', {
                ...form,
                request_id: Number(form.request_id),
                scheduled_at: form.scheduled_at.replace('T', ' ')
            });

            setMsg('Session scheduled!');
            await load();
        } catch (e) {
            setErr(e.response?.data?.message || 'Could not schedule session.');
        }
    }

    async function finish(id) {
        setErr('');

        try {
            await api.patch('/sessions/' + id, { status: 'completed' });
            setMsg('Session marked completed.');
            await load();
        } catch (e) {
            setErr(e.response?.data?.message || 'Could not update session.');
        }
    }

    return (
        <main className="page">
            <PageTitle
                eyebrow="MAKE TIME TO GROW"
                title="Learning sessions."
                subtitle="Turn your match into a moment to learn something new."
            />

            {err && <p className="error">{err}</p>}
            {msg && <p className="success">{msg}</p>}

            {requests.length > 0 && (
                <form className="panel schedule" onSubmit={schedule}>
                    <h3>Schedule a session</h3>

                    <label>
                        Accepted request
                        <select
                            required
                            value={form.request_id}
                            onChange={e =>
                                setForm({ ...form, request_id: e.target.value })
                            }
                        >
                            <option value="">Choose request</option>
                            {requests.map(r => (
                                <option key={r.id} value={r.id}>
                                    #{r.id} {r.sender_name} ↔ {r.receiver_name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Date and time
                        <input
                            required
                            type="datetime-local"
                            value={form.scheduled_at}
                            onChange={e =>
                                setForm({ ...form, scheduled_at: e.target.value })
                            }
                        />
                    </label>

                    <label>
                        Mode
                        <select
                            value={form.mode}
                            onChange={e => setForm({ ...form, mode: e.target.value })}
                        >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                    </label>

                    <label>
                        Link / place
                        <input
                            value={form.link_or_place}
                            onChange={e =>
                                setForm({ ...form, link_or_place: e.target.value })
                            }
                            placeholder="Meeting link or college library"
                        />
                    </label>

                    <button className="primary">Schedule →</button>
                </form>
            )}

            {!items.length ? (
                <Empty
                    title="Your calendar is ready"
                    copy="Accept a swap request first, then schedule a session."
                />
            ) : (
                <div className="cards">
                    {items.map(s => (
                        <article className="panel" key={s.id}>
                            <span className={'status ' + s.status}>{s.status}</span>
                            <h3>
                                {Number(s.sender_id) === Number(user.id)
                                    ? s.receiver_name
                                    : s.sender_name}
                            </h3>
                            <p>{s.teach_skill} ↔ {s.learn_skill}</p>
                            <p className="muted">
                                {new Date(s.scheduled_at).toLocaleString()}
                            </p>
                            <p className="muted">
                                {s.mode} {s.link_or_place ? '· ' + s.link_or_place : ''}
                            </p>

                            {s.status === 'scheduled' && (
                                <button
                                    className="primary wide"
                                    onClick={() => finish(s.id)}
                                >
                                    Mark completed ✓
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            )}

            <footer>
                SkillSwap <span>Learning is better together.</span>
            </footer>
        </main>
    );
}

function PageTitle({ eyebrow, title, subtitle }) {
    return (
        <div className="pagetitle">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
    );
}

function Empty({ title, copy }) {
    return (
        <div className="panel empty">
            <div className="emptyicon">↔</div>
            <h3>{title}</h3>
            <p>{copy}</p>
            <Link className="primary" to="/skills">
                Set up my skills →
            </Link>
        </div>
    );
}

export default App;
