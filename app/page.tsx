
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Define the type for a user based on your table structure
type User = {
  id: number;
  user_nm: string;
  user_id: string;
  age: number | null;
  created_at: string;
  birthday_dtm: string | null;
};

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ user_nm: "", user_id: "", age: "", birthday_dtm: "" });
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("tb_user_k").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching users:", error);
        setError("사용자 목록을 불러오는 데 실패했습니다.");
      } else {
        setUsers(data as User[]);
      }
    };
    fetchUsers();
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tb_user_k',
        },
        (payload) => {
          // In a real app, you'd handle different event types (INSERT, UPDATE, DELETE)
          // For this learning exercise, we'll just refetch the whole list for simplicity
          supabase.from("tb_user_k").select("*").order("created_at", { ascending: false })
            .then(response => {
              if (response.error) {
                console.error("Error refetching:", response.error);
              } else {
                setUsers(response.data as User[]);
              }
            });
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newUser.user_nm || !newUser.user_id) {
      setError("사용자 이름과 ID는 필수입니다.");
      return;
    }

    const { error } = await supabase.from("tb_user_k").insert({
      user_nm: newUser.user_nm,
      user_id: newUser.user_id,
      age: newUser.age ? parseInt(newUser.age, 10) : null,
      birthday_dtm: newUser.birthday_dtm || null,
    });

    if (error) {
      console.error("Error adding user:", error);
      setError(`사용자 추가에 실패했습니다: ${error.message}`);
    } else {
      // The real-time subscription will handle updating the list
      setNewUser({ user_nm: "", user_id: "", age: "", birthday_dtm: "" }); // Reset form
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Supabase CRUD 학습 - tb_user_k</h1>

      {/* Add User Form */}
      <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">새 사용자 추가</h2>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="user_nm"
            value={newUser.user_nm}
            onChange={handleInputChange}
            placeholder="사용자 이름 (필수)"
            className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="user_id"
            value={newUser.user_id}
            onChange={handleInputChange}
            placeholder="사용자 ID (필수)"
            className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="age"
            value={newUser.age}
            onChange={handleInputChange}
            placeholder="나이"
            className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="birthday_dtm"
            value={newUser.birthday_dtm}
            onChange={handleInputChange}
            className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            사용자 추가
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {/* User List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">사용자 목록</h2>
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {users.map(user => (
              <li key={user.id} className="p-4 flex justify-between items-center hover:bg-gray-700">
                <div>
                  <p className="font-semibold text-lg">{user.user_nm} <span className="text-sm text-gray-400">({user.user_id})</span></p>
                  <p className="text-gray-300">나이: {user.age || "미입력"}, 생일: {user.birthday_dtm || "미입력"}</p>
                  <p className="text-xs text-gray-500">ID: {user.id} / 생성일: {new Date(user.created_at).toLocaleString()}</p>
                </div>
                {/* Update/Delete buttons will go here in the next step */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
