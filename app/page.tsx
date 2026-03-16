
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// 1. 타입 정의: 데이터의 형태를 미리 정해 실수를 방지합니다.

// 데이터베이스의 `tb_user_k` 테이블의 한 행(row)에 해당하는 데이터 형태를 정의합니다.
// Supabase에서 받아온 데이터는 이 형태를 따르게 됩니다.
type User = {
  id: number; // 사용자 고유 ID (자동 생성)
  user_nm: string; // 사용자 이름
  user_id: string; // 사용자 로그인 ID
  age: number | null; // 나이 (null은 값이 없음을 의미)
  created_at: string; // 생성 시각 (자동 생성)
  birthday_dtm: string | null; // 생일 (null은 값이 없음을 의미)
};

// 수정 가능한 사용자 정보의 형태를 정의합니다.
// User 타입에서 id와 created_at 필드를 제외시켜, 이 값들이 수정되지 않도록 합니다.
type EditableUser = Omit<User, 'id' | 'created_at'>;

// 2. 메인 컴포넌트: 홈페이지의 전체 UI와 기능을 담당합니다.
export default function HomePage() {
  
  // 3. 상태(State) 관리: 컴포넌트가 기억해야 할 동적인 데이터들입니다.
  
  // 사용자 목록 전체를 저장하는 상태입니다. 이 배열의 내용이 화면에 목록으로 그려집니다.
  const [users, setUsers] = useState<User[]>([]);
  
  // '새 사용자 추가' 폼에 입력된 값을 저장하는 상태입니다.
  const [newUser, setNewUser] = useState({ user_nm: "", user_id: "", age: "", birthday_dtm: "" });
  
  // 에러 메시지를 저장하는 상태입니다. 에러가 발생하면 여기에 메시지가 담기고 화면에 표시됩니다.
  const [error, setError] = useState<string | null>(null);
  
  // '수정 모드'를 관리하는 상태입니다.
  // editingId: 현재 수정 중인 사용자의 id를 저장합니다. 아무도 수정하고 있지 않으면 null입니다.
  const [editingId, setEditingId] = useState<number | null>(null);
  // editingUser: 수정 중인 사용자의 변경된 데이터를 임시로 저장합니다.
  const [editingUser, setEditingUser] = useState<Partial<EditableUser> | null>(null);

  // 4. 데이터 불러오기 및 실시간 동기화 (useEffect 훅 사용)

  // useEffect: 특정 상황(예: 컴포넌트 첫 로딩)에 코드를 실행시키는 훅입니다.

  // 컴포넌트가 처음 화면에 렌더링될 때 한 번만 실행됩니다.
  // Supabase에서 전체 사용자 목록을 가져와 'users' 상태를 초기화합니다.
  useEffect(() => {
    const fetchUsers = async () => {
      // supabase의 'tb_user_k' 테이블에서 모든 열(*)을 선택(select)합니다.
      // created_at 열을 기준으로 내림차순(최신순)으로 정렬합니다.
      const { data, error } = await supabase.from("tb_user_k").select("*").order("created_at", { ascending: false });
      
      if (error) { // 데이터 로딩 중 에러가 발생했다면
        console.error("Error fetching users:", error);
        setError(`사용자 목록을 불러오는 데 실패했습니다.${error.message}`);
      } else { // 성공했다면
        setUsers(data as User[]); // 받아온 데이터를 users 상태에 저장합니다.
      }
    };
    fetchUsers();
  }, []); // 배열이 비어있으면, 컴포넌트가 처음 마운트될 때 딱 한 번만 실행됩니다.

  // Supabase의 실시간(Realtime) 기능을 구독(subscribe)하는 useEffect입니다.
  // 데이터베이스에 변경(INSERT, UPDATE, DELETE)이 생기면 즉시 감지하여 화면을 업데이트합니다.
  useEffect(() => {
    const channel = supabase
      .channel('db-changes') // 'db-changes'라는 이름의 채널을 만듭니다 (이름은 자유롭게 지정 가능).
      .on(
        'postgres_changes', // 데이터베이스 변경 이벤트를 감지합니다.
        {
          event: '*', // 모든 이벤트(INSERT, UPDATE, DELETE)를 감지합니다.
          schema: 'public', // public 스키마를 대상으로 합니다.
          table: 'tb_user_k', // 'tb_user_k' 테이블의 변경사항만 감지합니다.
        },
        (payload) => { // 변경이 감지되면 이 함수가 실행됩니다. 'payload'에 변경 정보가 담겨있습니다.
          // 이전처럼 목록 전체를 다시 불러오는 대신, 변경된 내용만 효율적으로 반영합니다.
          if (payload.eventType === 'INSERT') { // 새 데이터가 추가되었을 때
            // 기존 users 배열의 맨 앞에 새로 추가된 데이터를 넣습니다.
            setUsers(currentUsers => [payload.new as User, ...currentUsers]);
          } else if (payload.eventType === 'UPDATE') { // 데이터가 수정되었을 때
            // users 배열을 순회하며, id가 일치하는 항목을 새 데이터로 교체합니다.
            setUsers(currentUsers => currentUsers.map(user => user.id === payload.new.id ? { ...user, ...payload.new } : user));
          } else if (payload.eventType === 'DELETE') { // 데이터가 삭제되었을 때
            // users 배열에서 삭제된 데이터의 id와 일치하지 않는 항목만 남깁니다.
            setUsers(currentUsers => currentUsers.filter(user => user.id !== payload.old.id));
          }
        }
      )
      .subscribe(); // 위에서 설정한 내용으로 구독을 시작합니다.

    // 컴포넌트가 화면에서 사라질 때 실행되는 정리(cleanup) 함수입니다.
    // 불필요한 연결을 끊어 메모리 누수를 방지합니다.
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // 이 useEffect도 처음 한 번만 실행되어 구독을 설정합니다.


  // 5. 이벤트 핸들러: 사용자의 행동(클릭, 입력 등)에 반응하는 함수들입니다.

  // '새 사용자 추가' 폼의 각 입력 필드(input)에 값이 입력될 때마다 실행됩니다.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // 변경된 입력 필드의 이름(name)과 값(value)을 가져옵니다.
    setNewUser(prev => ({ ...prev, [name]: value })); // newUser 상태를 업데이트합니다.
  };
  
  // '수정 모드'의 입력 필드에 값이 입력될 때마다 실행됩니다.
  const handleEditingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingUser(prev => prev ? ({ ...prev, [name]: value }) : null); // editingUser 상태를 업데이트합니다.
  }

  // '사용자 추가' 버튼을 클릭하여 폼을 제출(submit)할 때 실행됩니다.
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 기본 동작을 막습니다.
    setError(null); // 이전 에러 메시지를 초기화합니다.

    // 필수 입력 값 확인
    if (!newUser.user_nm || !newUser.user_id) {
      setError("사용자 이름과 ID는 필수입니다.");
      return; // 함수 실행을 중단합니다.
    }

    // Supabase에 데이터를 추가(insert)합니다.
    const { error } = await supabase.from("tb_user_k").insert({
      user_nm: newUser.user_nm,
      user_id: newUser.user_id,
      age: newUser.age ? parseInt(newUser.age, 10) : null, // age가 비어있지 않으면 숫자로 변환, 비어있으면 null
      birthday_dtm: newUser.birthday_dtm || null, // birthday_dtm이 비어있으면 null
    });

    if (error) { // 데이터 추가 중 에러 발생 시
      setError(`사용자 추가에 실패했습니다: ${error.message}`);
    } else { // 성공 시
      setNewUser({ user_nm: "", user_id: "", age: "", birthday_dtm: "" }); // 폼을 초기화합니다.
      // 화면 업데이트는 실시간 구독이 자동으로 처리해줍니다.
    }
  };
  
  // '삭제' 버튼을 클릭했을 때 실행됩니다.
  const handleDelete = async (id: number) => {
    // Supabase에서 특정 id를 가진 데이터를 삭제(delete)합니다.
    const { error } = await supabase.from("tb_user_k").delete().match({ id });
    if (error) {
        setError(`사용자 삭제에 실패했습니다: ${error.message}`);
    }
    // 성공 시 화면 업데이트는 실시간 구독이 자동으로 처리합니다.
  }

  // '수정' 버튼을 클릭했을 때 실행됩니다.
  const handleStartEditing = (user: User) => {
    setEditingId(user.id); // 어떤 사용자를 수정할지 id로 저장하여 '수정 모드'로 전환합니다.
    // 날짜 형식을 <input type="date">에 맞게 'YYYY-MM-DD'로 변환합니다.
    const birthday = user.birthday_dtm ? new Date(user.birthday_dtm).toISOString().split('T')[0] : "";
    setEditingUser({ ...user, birthday_dtm: birthday }); // 현재 사용자 정보를 editingUser 상태에 복사합니다.
  }

  // '취소' 버튼(수정 모드에서)을 클릭했을 때 실행됩니다.
  const handleCancelEditing = () => {
    setEditingId(null); // '수정 모드'를 해제합니다.
    setEditingUser(null); // 임시 데이터도 비웁니다.
  }

  // '저장' 버튼(수정 모드에서)을 클릭했을 때 실행됩니다.
  const handleSaveUser = async (id: number) => {
    if (!editingUser) return; // 수정할 내용이 없으면 함수를 종료합니다.
    
    // Supabase에 업데이트할 데이터를 준비합니다.
    const updateData = {
        user_nm: editingUser.user_nm,
        user_id: editingUser.user_id,
        age: editingUser.age ? parseInt(String(editingUser.age), 10) : null,
        birthday_dtm: editingUser.birthday_dtm || null
    };

    // Supabase에서 특정 id를 가진 데이터를 업데이트(update)합니다.
    const { error } = await supabase.from("tb_user_k").update(updateData).match({ id });

    if (error) {
        setError(`사용자 수정에 실패했습니다: ${error.message}`);
    } else {
        // 성공 시 '수정 모드'를 해제합니다.
        setEditingId(null);
        setEditingUser(null);
        // 화면 업데이트는 실시간 구독이 처리합니다.
    }
  }


  // 6. JSX 렌더링: 실제 화면에 그려지는 부분입니다.
  return (
    <div className="container mx-auto p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Supabase CRUD 학습 - tb_user_k</h1>

      {/* ----- 새 사용자 추가 폼 ----- */}
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
        {/* error 상태에 메시지가 있으면 화면에 표시합니다. */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {/* ----- 사용자 목록 ----- */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">사용자 목록</h2>
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {/* users 배열을 순회하며 각 사용자를 <li> 태그로 렌더링합니다. */}
            {users.map(user => (
              <li key={user.id} className="p-4 hover:bg-gray-700 transition-colors duration-200">
                
                {/* 조건부 렌더링: '수정 모드'인지 아닌지에 따라 다른 UI를 보여줍니다. */}
                {editingId === user.id ? (
                  // ----- 1. 수정 모드 UI (입력 필드와 저장/취소 버튼) -----
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* `?? ''` : 만약 editingUser.user_nm이 null이나 undefined이면 빈 문자열('')을 사용합니다. (오류 방지) */}
                      <input type="text" name="user_nm" value={editingUser?.user_nm ?? ''} onChange={handleEditingInputChange} className="p-2 rounded bg-gray-600 border border-gray-500 w-full"/>
                      <input type="text" name="user_id" value={editingUser?.user_id ?? ''} onChange={handleEditingInputChange} className="p-2 rounded bg-gray-600 border border-gray-500 w-full"/>
                      <input type="number" name="age" value={editingUser?.age ?? ''} onChange={handleEditingInputChange} className="p-2 rounded bg-gray-600 border border-gray-500 w-full"/>
                      <input type="date" name="birthday_dtm" value={editingUser?.birthday_dtm ?? ''} onChange={handleEditingInputChange} className="p-2 rounded bg-gray-600 border border-gray-500 w-full"/>
                    </div>
                    <div className="flex justify-end space-x-2">
                       <button onClick={() => handleSaveUser(user.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">저장</button>
                       <button onClick={handleCancelEditing} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded text-sm">취소</button>
                    </div>
                  </div>
                ) : (
                  // ----- 2. 일반 모드 UI (텍스트와 수정/삭제 버튼) -----
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{user.user_nm} <span className="text-sm text-gray-400">({user.user_id})</span></p>
                      <p className="text-gray-300">나이: {user.age || "미입력"}, 생일: {user.birthday_dtm || "미입력"}</p>
                      <p className="text-xs text-gray-500">ID: {user.id} / 생성일: {new Date(user.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleStartEditing(user)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm">수정</button>
                      <button onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">삭제</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
