interface Props {
  role: "student" | "instructor" | "admin";
}

export function Sidebar({ role }: Props) {
  return (
    <div className="w-64 bg-white border-r h-screen p-4">
      <h2 className="font-bold mb-6">Menu</h2>

      {role === "student" && <p>📘 My Exams</p>}
      {role === "instructor" && <p>📝 Create Exam</p>}
      {role === "admin" && <p>⚙ Manage Users</p>}
    </div>
  );
}