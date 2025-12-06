import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";

const blankLessonForm = {
  title: "",
  courseId: "",
  level: "Beginner",
  duration: "15 min read",
  overview: "",
  outline: "",
  notes: "",
  challengePrompt: "",
  challengeFields: "",
};

const makeBlankQuestion = () => ({
  prompt: "",
  options: ["", "", "", ""],
  answer: 0,
  explanation: "",
  correctFeedback: "",
  incorrectFeedback: "",
});

const blankQuizForm = {
  title: "",
  courseId: "",
  description: "",
  notes: "",
  questions: [makeBlankQuestion()],
};

const blankWorkspaceForm = {
  title: "",
  lessonId: "",
  collaborators: "",
  notes: "",
};

const parseCollaboratorList = (value = "") =>
  value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

function buildLessonBlocks(form) {
  const blocks = [];
  if (form.overview.trim()) {
    blocks.push({ heading: "Overview", copy: form.overview.trim(), list: [] });
  }
  const outlineItems = form.outline
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (outlineItems.length) {
    blocks.push({ heading: "Key Points", copy: "", list: outlineItems });
  }
  return blocks;
}

function buildLessonChallenge(form) {
  const prompt = form.challengePrompt.trim();
  const fields = form.challengeFields
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);
  if (!prompt && fields.length === 0) {
    return undefined;
  }
  return { prompt, fields };
}

function hydrateLessonForm(lesson) {
  const overviewBlock = (lesson.blocks || []).find((block) => block.copy);
  const listBlock = (lesson.blocks || []).find((block) => (block.list || []).length);
  return {
    title: lesson.title || "",
    courseId: lesson.courseId || "",
    level: lesson.level || "Beginner",
    duration: lesson.duration || "15 min read",
    overview: overviewBlock?.copy || "",
    outline: (listBlock?.list || []).join("\n"),
    notes: lesson.approval?.notes || "",
    challengePrompt: lesson.challenge?.prompt || "",
    challengeFields: (lesson.challenge?.fields || []).join(", "),
  };
}

function hydrateQuizForm(quiz) {
  return {
    title: quiz.title || "",
    courseId: quiz.courseId || "",
    description: quiz.description || "",
    notes: quiz.approval?.notes || "",
    questions: (quiz.questions || []).map((question) => ({
      prompt: question.prompt || "",
      options: (question.options || []).length ? [...question.options] : ["", ""],
      answer: typeof question.answer === "number" ? question.answer : 0,
      explanation: question.explanation || "",
      correctFeedback: question.correctFeedback || "",
      incorrectFeedback: question.incorrectFeedback || "",
    })),
  };
}

function formatStatus(status) {
  if (!status) return "Draft";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function summarizeHistory(approval) {
  if (!approval?.history?.length) return "Pending review";
  const latest = approval.history[approval.history.length - 1];
  return `${latest.action} • ${new Date(latest.at || latest.createdAt || Date.now()).toLocaleDateString()}`;
}

export default function Instructor() {
  const { api, isInstructor, isAdmin } = useApp();
  const allowed = isInstructor || isAdmin;
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonForm, setLessonForm] = useState(blankLessonForm);
  const [quizForm, setQuizForm] = useState(blankQuizForm);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [notification, setNotification] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceError, setWorkspaceError] = useState(null);
  const [workspaceForm, setWorkspaceForm] = useState(blankWorkspaceForm);
  const [workspaceSubmitting, setWorkspaceSubmitting] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [collaboratorSubmitting, setCollaboratorSubmitting] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  const loadStudio = useCallback(async () => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = await api("/instructor/studio");
      setStudio(payload);
    } catch (err) {
      setError(err.message || "Failed to load instructor studio");
    } finally {
      setLoading(false);
    }
  }, [allowed, api]);

  useEffect(() => {
    loadStudio();
  }, [loadStudio]);

  const loadWorkspaces = useCallback(async () => {
    if (!allowed) {
      setWorkspaceLoading(false);
      return;
    }
    setWorkspaceLoading(true);
    setWorkspaceError(null);
    try {
      const payload = await api("/instructor/workspaces");
      const rows = payload.workspaces || [];
      setWorkspaces(rows);
      setSelectedWorkspaceId((prev) => prev || (rows[0]?.id ?? null));
    } catch (err) {
      setWorkspaceError(err.message || "Failed to load workspaces");
    } finally {
      setWorkspaceLoading(false);
    }
  }, [allowed, api]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    if (!workspaces.length) {
      setSelectedWorkspaceId(null);
      return;
    }
    if (selectedWorkspaceId && !workspaces.some((ws) => ws.id === selectedWorkspaceId)) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  useEffect(() => {
    if (!notification) return undefined;
    const id = setTimeout(() => setNotification(null), 2400);
    return () => clearTimeout(id);
  }, [notification]);

  const lessonStats = useMemo(() => {
    const stats = { draft: 0, pending: 0, published: 0 };
    (studio?.lessons || []).forEach((lesson) => {
      const key = (lesson.status || "draft").toLowerCase();
      stats[key] = (stats[key] || 0) + 1;
    });
    return stats;
  }, [studio]);

  const quizStats = useMemo(() => {
    const stats = { draft: 0, pending: 0, published: 0 };
    (studio?.quizzes || []).forEach((quiz) => {
      const key = (quiz.status || "draft").toLowerCase();
      stats[key] = (stats[key] || 0) + 1;
    });
    return stats;
  }, [studio]);

  const selectedWorkspace = useMemo(() => {
    if (!selectedWorkspaceId) return null;
    return workspaces.find((workspace) => workspace.id === selectedWorkspaceId) || null;
  }, [selectedWorkspaceId, workspaces]);

  function pushNotice(message) {
    setNotification({ id: Date.now(), message });
  }

  function upsertWorkspace(nextWorkspace) {
    if (!nextWorkspace) return;
    setWorkspaces((prev) => [nextWorkspace, ...prev.filter((ws) => ws.id !== nextWorkspace.id)]);
    setSelectedWorkspaceId(nextWorkspace.id);
  }

  function resetLessonForm() {
    setLessonForm(blankLessonForm);
    setEditingLessonId(null);
  }

  function resetQuizForm() {
    setQuizForm(blankQuizForm);
    setEditingQuizId(null);
  }

  function handleLessonField(field, value) {
    setLessonForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleQuizField(field, value) {
    setQuizForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleWorkspaceField(field, value) {
    setWorkspaceForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleQuestionChange(questionIndex, updater) {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, idx) => (idx === questionIndex ? updater(question) : question)),
    }));
  }

  function addQuestion() {
    setQuizForm((prev) => ({ ...prev, questions: [...prev.questions, makeBlankQuestion()] }));
  }

  function removeQuestion(index) {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== index),
    }));
  }

  function addOption(questionIndex) {
    handleQuestionChange(questionIndex, (question) => ({
      ...question,
      options: [...question.options, ""],
    }));
  }

  function removeOption(questionIndex, optionIndex) {
    handleQuestionChange(questionIndex, (question) => {
      if (question.options.length <= 2) {
        return question;
      }
      const nextOptions = question.options.filter((_, idx) => idx !== optionIndex);
      const nextAnswer = Math.min(question.answer, nextOptions.length - 1);
      return { ...question, options: nextOptions, answer: nextAnswer };
    });
  }

  function composeLessonPayload() {
    const blocks = buildLessonBlocks(lessonForm);
    const payload = {
      title: lessonForm.title.trim(),
      courseId: lessonForm.courseId.trim() || undefined,
      level: lessonForm.level || "Beginner",
      duration: lessonForm.duration || "15 min read",
      notes: lessonForm.notes.trim() || undefined,
      blocks,
    };
    const challenge = buildLessonChallenge(lessonForm);
    if (challenge) {
      payload.challenge = challenge;
    }
    return payload;
  }

  function composeQuizPayload() {
    const questions = quizForm.questions.map((question) => {
      const options = question.options.map((option) => option.trim()).filter(Boolean);
      return {
        ...question,
        prompt: question.prompt.trim(),
        options,
        answer: Math.min(question.answer, Math.max(options.length - 1, 0)),
        explanation: question.explanation.trim(),
        correctFeedback: question.correctFeedback.trim(),
        incorrectFeedback: question.incorrectFeedback.trim(),
      };
    });
    return {
      title: quizForm.title.trim(),
      courseId: quizForm.courseId.trim() || undefined,
      description: quizForm.description.trim(),
      notes: quizForm.notes.trim() || undefined,
      questions,
    };
  }

  async function handleWorkspaceSubmit(event) {
    event.preventDefault();
    if (!workspaceForm.title.trim()) {
      pushNotice("Workspace title is required");
      return;
    }
    setWorkspaceSubmitting(true);
    try {
      const collaborators = parseCollaboratorList(workspaceForm.collaborators);
      const payload = await api("/instructor/workspaces", {
        method: "POST",
        body: {
          title: workspaceForm.title.trim(),
          lessonId: workspaceForm.lessonId.trim() || undefined,
          notes: workspaceForm.notes.trim() || undefined,
          collaborators,
        },
      });
      upsertWorkspace(payload.workspace);
      setWorkspaceForm(blankWorkspaceForm);
      pushNotice("Workspace created");
    } catch (err) {
      pushNotice(err.message || "Unable to create workspace");
    } finally {
      setWorkspaceSubmitting(false);
    }
  }

  async function handleCollaboratorAdd(event) {
    event.preventDefault();
    if (!selectedWorkspace) {
      pushNotice("Select a workspace first");
      return;
    }
    if (!collaboratorInput.trim()) {
      pushNotice("Enter an email to invite");
      return;
    }
    setCollaboratorSubmitting(true);
    try {
      const payload = await api(`/instructor/workspaces/${selectedWorkspace.id}/collaborators`, {
        method: "POST",
        body: { email: collaboratorInput.trim() },
      });
      upsertWorkspace(payload.workspace);
      setCollaboratorInput("");
      pushNotice(payload.message || "Collaborator added");
    } catch (err) {
      pushNotice(err.message || "Unable to add collaborator");
    } finally {
      setCollaboratorSubmitting(false);
    }
  }

  async function handleCollaboratorRemove(memberId) {
    if (!selectedWorkspace) return;
    try {
      const payload = await api(`/instructor/workspaces/${selectedWorkspace.id}/collaborators/${memberId}`, {
        method: "DELETE",
      });
      upsertWorkspace(payload.workspace);
      pushNotice("Collaborator removed");
    } catch (err) {
      pushNotice(err.message || "Unable to remove collaborator");
    }
  }

  async function handlePostNote(event) {
    event.preventDefault();
    if (!selectedWorkspace) {
      pushNotice("Select a workspace to post updates");
      return;
    }
    if (!noteBody.trim()) {
      pushNotice("Add a short note before posting");
      return;
    }
    setNoteSubmitting(true);
    try {
      const payload = await api(`/instructor/workspaces/${selectedWorkspace.id}/threads`, {
        method: "POST",
        body: { body: noteBody.trim() },
      });
      upsertWorkspace(payload.workspace);
      setNoteBody("");
      pushNotice("Note posted");
    } catch (err) {
      pushNotice(err.message || "Unable to post note");
    } finally {
      setNoteSubmitting(false);
    }
  }

  async function handleLessonSubmit(event) {
    event.preventDefault();
    if (!lessonForm.title.trim()) {
      pushNotice("Lesson title is required");
      return;
    }
    const payload = composeLessonPayload();
    setSavingLesson(true);
    try {
      const endpoint = editingLessonId ? `/instructor/lessons/${editingLessonId}` : "/instructor/lessons";
      const method = editingLessonId ? "PUT" : "POST";
      await api(endpoint, { method, body: payload });
      pushNotice(editingLessonId ? "Lesson draft updated" : "Lesson draft submitted");
      resetLessonForm();
      await loadStudio();
    } catch (err) {
      pushNotice(err.message || "Unable to save lesson draft");
    } finally {
      setSavingLesson(false);
    }
  }

  async function handleQuizSubmit(event) {
    event.preventDefault();
    if (!quizForm.title.trim()) {
      pushNotice("Quiz title is required");
      return;
    }
    if (!quizForm.questions.length) {
      pushNotice("Add at least one question");
      return;
    }
    const payload = composeQuizPayload();
    if (payload.questions.some((question) => question.options.length < 2)) {
      pushNotice("Each question needs at least two answer options");
      return;
    }
    if (payload.questions.some((question) => !question.prompt)) {
      pushNotice("Question prompts cannot be empty");
      return;
    }
    setSavingQuiz(true);
    try {
      const endpoint = editingQuizId ? `/instructor/quizzes/${editingQuizId}` : "/instructor/quizzes";
      const method = editingQuizId ? "PUT" : "POST";
      await api(endpoint, { method, body: payload });
      pushNotice(editingQuizId ? "Quiz draft updated" : "Quiz draft submitted");
      resetQuizForm();
      await loadStudio();
    } catch (err) {
      pushNotice(err.message || "Unable to save quiz draft");
    } finally {
      setSavingQuiz(false);
    }
  }

  if (!allowed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Instructor workspace</h1>
        <p className="mt-3 text-gray-500">Sign in with an instructor or admin account to access the content studio.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        Loading studio data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
        <button className="btn mt-4" onClick={loadStudio}>Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {notification && (
        <div className="fixed top-4 left-1/2 z-20 -translate-x-1/2 rounded-md bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {notification.message}
        </div>
      )}

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Instructor Studio</h1>
        <p className="text-gray-600">Draft lessons and quizzes, monitor approvals, and keep content moving through review.</p>
      </header>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs uppercase text-gray-500">Lesson drafts</div>
          <div className="text-3xl font-semibold">{lessonStats.draft}</div>
          <div className="text-xs text-gray-500">{lessonStats.pending} awaiting review</div>
        </div>
        <div className="card p-4">
          <div className="text-xs uppercase text-gray-500">Quiz drafts</div>
          <div className="text-3xl font-semibold">{quizStats.draft}</div>
          <div className="text-xs text-gray-500">{quizStats.pending} awaiting review</div>
        </div>
        <div className="card p-4">
          <div className="text-xs uppercase text-gray-500">Open approvals</div>
          <div className="text-3xl font-semibold">{studio?.approvals?.length || 0}</div>
          <div className="text-xs text-gray-500">Latest updates in queue</div>
        </div>
        <div className="card p-4">
          <div className="text-xs uppercase text-gray-500">Published assets</div>
          <div className="text-3xl font-semibold">{(lessonStats.published || 0) + (quizStats.published || 0)}</div>
          <div className="text-xs text-gray-500">Combined lessons & quizzes</div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Lesson drafts</h2>
            <button className="btn btn-ghost text-xs" onClick={resetLessonForm}>
              New draft
            </button>
          </div>
          <div className="space-y-3">
            {(studio?.lessons || []).map((lesson) => (
              <div key={lesson.id} className="border rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{lesson.title}</div>
                    <div className="text-xs text-gray-500">{lesson.course || "Unassigned course"}</div>
                  </div>
                  <span className="text-xs rounded-full px-2 py-1 bg-gray-100">{formatStatus(lesson.status)}</span>
                </div>
                <div className="text-xs text-gray-500">{lesson.approval ? summarizeHistory(lesson.approval) : "Draft not submitted yet"}</div>
                <div className="flex gap-2">
                  <button className="btn btn-primary text-xs" onClick={() => {
                    setEditingLessonId(lesson.id);
                    setLessonForm(hydrateLessonForm(lesson));
                  }}>
                    Edit draft
                  </button>
                  <button className="btn btn-ghost text-xs" onClick={() => {
                    pushNotice("Snapshots coming soon");
                  }}>
                    Preview
                  </button>
                </div>
              </div>
            ))}
            {!studio?.lessons?.length && (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                No lessons yet — start drafting below.
              </div>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Quiz drafts</h2>
            <button className="btn btn-ghost text-xs" onClick={resetQuizForm}>
              New draft
            </button>
          </div>
          <div className="space-y-3">
            {(studio?.quizzes || []).map((quiz) => (
              <div key={quiz.id} className="border rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{quiz.title}</div>
                    <div className="text-xs text-gray-500">{quiz.course || "Unassigned course"}</div>
                  </div>
                  <span className="text-xs rounded-full px-2 py-1 bg-gray-100">{formatStatus(quiz.status)}</span>
                </div>
                <div className="text-xs text-gray-500">{quiz.approval ? summarizeHistory(quiz.approval) : "Draft not submitted yet"}</div>
                <div className="flex gap-2">
                  <button className="btn btn-primary text-xs" onClick={() => {
                    setEditingQuizId(quiz.id);
                    setQuizForm(hydrateQuizForm(quiz));
                  }}>
                    Edit draft
                  </button>
                  <button className="btn btn-ghost text-xs" onClick={() => pushNotice("Preview coming soon")}>Preview</button>
                </div>
              </div>
            ))}
            {!studio?.quizzes?.length && (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                No quizzes yet — craft your first assessment below.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Approval timeline</h2>
          <button className="btn btn-ghost text-xs" onClick={loadStudio}>Refresh</button>
        </div>
        <div className="space-y-3">
          {(studio?.approvals || []).map((approval) => (
            <div key={approval.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{approval.type?.toUpperCase()} #{approval.id}</div>
                <span className="text-xs rounded-full px-2 py-1 bg-gray-100">{formatStatus(approval.status)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Submitted on {new Date(approval.submittedAt || approval.createdAt || Date.now()).toLocaleDateString()}</div>
              <div className="mt-2 text-sm">{approval.notes || "No reviewer notes yet"}</div>
            </div>
          ))}
          {!studio?.approvals?.length && (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
              No submissions in queue — ship a draft to kick off review.
            </div>
          )}
        </div>
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Shared workspace</h2>
            <p className="text-sm text-gray-500">Co-build lessons and keep threaded notes with your collaborators.</p>
          </div>
          <button className="btn btn-ghost text-xs" type="button" onClick={loadWorkspaces} disabled={workspaceLoading}>
            Refresh
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-3 max-h-80 overflow-auto">
              {workspaceLoading && <div className="text-sm text-gray-500">Loading workspaces…</div>}
              {workspaceError && (
                <div className="text-sm text-red-600">
                  {workspaceError}
                  <button className="ml-2 underline text-xs" type="button" onClick={loadWorkspaces}>Retry</button>
                </div>
              )}
              {!workspaceLoading && !workspaceError && !workspaces.length && (
                <div className="text-sm text-gray-500">No shared spaces yet — create one below.</div>
              )}
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => setSelectedWorkspaceId(workspace.id)}
                  className={`w-full text-left border rounded-lg p-3 ${
                    selectedWorkspaceId === workspace.id ? "border-black bg-gray-50 dark:bg-gray-800" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{workspace.title}</div>
                      <div className="text-xs text-gray-500">{workspace.lesson?.title || "Unlinked lesson"}</div>
                    </div>
                    <span className="text-xs text-gray-500">{workspace.members?.length || 1} collaborators</span>
                  </div>
                  {workspace.notes && <p className="mt-2 text-xs text-gray-600">{workspace.notes}</p>}
                </button>
              ))}
            </div>
            <form className="space-y-3" onSubmit={handleWorkspaceSubmit}>
              <h3 className="text-sm font-semibold">Create workspace</h3>
              <input
                className="input"
                placeholder="Workspace title"
                value={workspaceForm.title}
                onChange={(event) => handleWorkspaceField("title", event.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Lesson legacy ID (optional)"
                value={workspaceForm.lessonId}
                onChange={(event) => handleWorkspaceField("lessonId", event.target.value)}
              />
              <input
                className="input"
                placeholder="Collaborator emails (comma separated)"
                value={workspaceForm.collaborators}
                onChange={(event) => handleWorkspaceField("collaborators", event.target.value)}
              />
              <textarea
                className="input min-h-[72px]"
                placeholder="Workspace notes"
                value={workspaceForm.notes}
                onChange={(event) => handleWorkspaceField("notes", event.target.value)}
              />
              <button className="btn btn-primary" type="submit" disabled={workspaceSubmitting}>
                {workspaceSubmitting ? "Creating…" : "Create workspace"}
              </button>
            </form>
          </div>
          <div className="space-y-4">
            {selectedWorkspace ? (
              <>
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{selectedWorkspace.title}</div>
                      <div className="text-xs text-gray-500">{selectedWorkspace.lesson?.title || "No linked lesson"}</div>
                    </div>
                    <span className="text-xs text-gray-500">{selectedWorkspace.members?.length || 1} collaborators</span>
                  </div>
                  {selectedWorkspace.notes && <p className="mt-2 text-sm text-gray-600">{selectedWorkspace.notes}</p>}
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Collaborators</h3>
                  <ul className="space-y-2">
                    {(selectedWorkspace.members || []).map((member) => (
                      <li key={member.id} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                        <div>
                          <div className="font-medium">{member.name || member.email}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                        <button
                          type="button"
                          className="text-xs underline"
                          onClick={() => handleCollaboratorRemove(member.id)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <form className="flex gap-2" onSubmit={handleCollaboratorAdd}>
                    <input
                      className="input"
                      placeholder="Invite by email"
                      value={collaboratorInput}
                      onChange={(event) => setCollaboratorInput(event.target.value)}
                    />
                    <button className="btn btn-primary" type="submit" disabled={collaboratorSubmitting}>
                      {collaboratorSubmitting ? "Adding…" : "Invite"}
                    </button>
                  </form>
                </div>
                <form className="space-y-2" onSubmit={handlePostNote}>
                  <h3 className="text-sm font-semibold">Collaboration notes</h3>
                  <textarea
                    className="input min-h-[72px]"
                    placeholder="Drop a quick update for the team"
                    value={noteBody}
                    onChange={(event) => setNoteBody(event.target.value)}
                  />
                  <button className="btn btn-primary" type="submit" disabled={noteSubmitting}>
                    {noteSubmitting ? "Posting…" : "Post note"}
                  </button>
                </form>
                <div className="space-y-2 max-h-64 overflow-auto">
                  <h3 className="text-sm font-semibold">Thread</h3>
                  {selectedWorkspace.threads?.length ? (
                    selectedWorkspace.threads.map((entry) => (
                      <article key={`${entry.createdAt}-${entry.body}`} className="border rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{entry.author?.name || entry.author?.email || "Collaborator"}</div>
                          <span className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-gray-700">{entry.body}</p>
                      </article>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No notes yet.</div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500 border border-dashed rounded-lg p-4">
                Select a workspace to manage collaborators
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form className="card p-4 space-y-4" onSubmit={handleLessonSubmit}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Lesson composer</h2>
            {editingLessonId ? (
              <button type="button" className="text-xs underline" onClick={resetLessonForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
          <div className="grid gap-3">
            <input
              className="input"
              placeholder="Lesson title"
              value={lessonForm.title}
              onChange={(event) => handleLessonField("title", event.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Course legacy ID (optional)"
              value={lessonForm.courseId}
              onChange={(event) => handleLessonField("courseId", event.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="input"
                value={lessonForm.level}
                onChange={(event) => handleLessonField("level", event.target.value)}
              >
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Duration"
                value={lessonForm.duration}
                onChange={(event) => handleLessonField("duration", event.target.value)}
              />
            </div>
            <textarea
              className="input min-h-[96px]"
              placeholder="Overview copy"
              value={lessonForm.overview}
              onChange={(event) => handleLessonField("overview", event.target.value)}
            />
            <textarea
              className="input min-h-[96px]"
              placeholder="Key points (one per line)"
              value={lessonForm.outline}
              onChange={(event) => handleLessonField("outline", event.target.value)}
            />
            <textarea
              className="input min-h-[72px]"
              placeholder="Reviewer notes"
              value={lessonForm.notes}
              onChange={(event) => handleLessonField("notes", event.target.value)}
            />
            <input
              className="input"
              placeholder="Challenge prompt"
              value={lessonForm.challengePrompt}
              onChange={(event) => handleLessonField("challengePrompt", event.target.value)}
            />
            <input
              className="input"
              placeholder="Challenge fields (comma separated)"
              value={lessonForm.challengeFields}
              onChange={(event) => handleLessonField("challengeFields", event.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={savingLesson}>
            {savingLesson ? "Saving…" : editingLessonId ? "Update draft" : "Submit for review"}
          </button>
        </form>

        <form className="card p-4 space-y-4" onSubmit={handleQuizSubmit}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Quiz composer</h2>
            {editingQuizId ? (
              <button type="button" className="text-xs underline" onClick={resetQuizForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
          <div className="grid gap-3">
            <input
              className="input"
              placeholder="Quiz title"
              value={quizForm.title}
              onChange={(event) => handleQuizField("title", event.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Course legacy ID (optional)"
              value={quizForm.courseId}
              onChange={(event) => handleQuizField("courseId", event.target.value)}
            />
            <textarea
              className="input min-h-[72px]"
              placeholder="Short description"
              value={quizForm.description}
              onChange={(event) => handleQuizField("description", event.target.value)}
            />
            <textarea
              className="input min-h-[72px]"
              placeholder="Reviewer notes"
              value={quizForm.notes}
              onChange={(event) => handleQuizField("notes", event.target.value)}
            />
          </div>

          <div className="space-y-4">
            {quizForm.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Question {questionIndex + 1}</div>
                  {quizForm.questions.length > 1 && (
                    <button
                      type="button"
                      className="text-xs underline"
                      onClick={() => removeQuestion(questionIndex)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  className="input"
                  placeholder="Prompt"
                  value={question.prompt}
                  onChange={(event) => handleQuestionChange(questionIndex, (prev) => ({ ...prev, prompt: event.target.value }))}
                />
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`answer-${questionIndex}`}
                        className="accent-black"
                        checked={question.answer === optionIndex}
                        onChange={() => handleQuestionChange(questionIndex, (prev) => ({ ...prev, answer: optionIndex }))}
                      />
                      <input
                        className="input flex-1"
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(event) => handleQuestionChange(questionIndex, (prev) => ({
                          ...prev,
                          options: prev.options.map((opt, idx) => (idx === optionIndex ? event.target.value : opt)),
                        }))}
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          className="text-xs underline"
                          onClick={() => removeOption(questionIndex, optionIndex)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost text-xs" onClick={() => addOption(questionIndex)}>
                    + Add option
                  </button>
                </div>
                <textarea
                  className="input min-h-[56px]"
                  placeholder="Explanation"
                  value={question.explanation}
                  onChange={(event) => handleQuestionChange(questionIndex, (prev) => ({ ...prev, explanation: event.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="input"
                    placeholder="Correct feedback"
                    value={question.correctFeedback}
                    onChange={(event) => handleQuestionChange(questionIndex, (prev) => ({ ...prev, correctFeedback: event.target.value }))}
                  />
                  <input
                    className="input"
                    placeholder="Incorrect feedback"
                    value={question.incorrectFeedback}
                    onChange={(event) => handleQuestionChange(questionIndex, (prev) => ({ ...prev, incorrectFeedback: event.target.value }))}
                  />
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-ghost text-xs" onClick={addQuestion}>
              + Add question
            </button>
          </div>

          <button className="btn btn-primary" type="submit" disabled={savingQuiz}>
            {savingQuiz ? "Saving…" : editingQuizId ? "Update quiz" : "Submit for review"}
          </button>
        </form>
      </section>
    </div>
  );
}
