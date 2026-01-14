'use client';

import { useState } from 'react';

type TaskStatus = 'Pending' | 'Running' | 'Completed';

interface SubTask {
  id: string;
  title: string;
  status: TaskStatus;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  subtasks: SubTask[];
  isExpanded: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        status: 'Pending',
        subtasks: [],
        isExpanded: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const saveTaskEdit = () => {
    if (editingTitle.trim()) {
      setTasks(tasks.map(task =>
        task.id === editingTaskId ? { ...task, title: editingTitle } : task
      ));
    }
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingSubtaskId(null);
    setEditingTitle('');
  };

  const toggleExpand = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, isExpanded: !task.isExpanded } : task
    ));
  };

  const addSubtask = (taskId: string) => {
    const subtaskTitle = prompt('サブタスクのタイトルを入力してください:');
    if (subtaskTitle && subtaskTitle.trim()) {
      const newSubtask: SubTask = {
        id: Date.now().toString(),
        title: subtaskTitle,
        status: 'Pending',
      };
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, subtasks: [...task.subtasks, newSubtask], isExpanded: true }
          : task
      ));
    }
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, subtasks: task.subtasks.filter(st => st.id !== subtaskId) }
        : task
    ));
  };

  const updateSubtaskStatus = (taskId: string, subtaskId: string, status: TaskStatus) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(st =>
              st.id === subtaskId ? { ...st, status } : st
            )
          }
        : task
    ));
  };

  const startEditingSubtask = (subtask: SubTask) => {
    setEditingSubtaskId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const saveSubtaskEdit = (taskId: string) => {
    if (editingTitle.trim()) {
      setTasks(tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(st =>
                st.id === editingSubtaskId ? { ...st, title: editingTitle } : st
              )
            }
          : task
      ));
    }
    setEditingSubtaskId(null);
    setEditingTitle('');
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Running':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusButtonColor = (status: TaskStatus, currentStatus: TaskStatus) => {
    const isActive = status === currentStatus;
    switch (status) {
      case 'Pending':
        return isActive
          ? 'bg-gray-200 text-gray-900 font-medium'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100';
      case 'Running':
        return isActive
          ? 'bg-blue-200 text-blue-900 font-medium'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100';
      case 'Completed':
        return isActive
          ? 'bg-green-200 text-green-900 font-medium'
          : 'bg-green-50 text-green-600 hover:bg-green-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          📝 TODO管理アプリ
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTask}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              追加
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {task.subtasks.length > 0 && (
                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="text-gray-500 hover:text-gray-700 mt-1"
                    >
                      {task.isExpanded ? '▼' : '▶'}
                    </button>
                  )}

                  <div className="flex-1">
                    {editingTaskId === task.id ? (
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveTaskEdit()}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={saveTaskEdit}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2">
                      {(['Pending', 'Running', 'Completed'] as TaskStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => updateTaskStatus(task.id, status)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${getStatusButtonColor(status, task.status)}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditingTask(task)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => addSubtask(task.id)}
                        className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                      >
                        サブタスク追加
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>

                {task.isExpanded && task.subtasks.length > 0 && (
                  <div className="mt-4 ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
                    {task.subtasks.map(subtask => (
                      <div key={subtask.id} className="bg-gray-50 rounded p-3">
                        {editingSubtaskId === subtask.id ? (
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && saveSubtaskEdit(task.id)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => saveSubtaskEdit(task.id)}
                              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                            >
                              保存
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs"
                            >
                              キャンセル
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-700">{subtask.title}</span>
                            <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(subtask.status)}`}>
                              {subtask.status}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-2">
                          {(['Pending', 'Running', 'Completed'] as TaskStatus[]).map(status => (
                            <button
                              key={status}
                              onClick={() => updateSubtaskStatus(task.id, subtask.id, status)}
                              className={`px-2 py-0.5 rounded text-xs transition-colors ${getStatusButtonColor(status, subtask.status)}`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditingSubtask(subtask)}
                            className="px-2 py-0.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => deleteSubtask(task.id, subtask.id)}
                            className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-lg">タスクがありません</p>
            <p className="text-sm">上のフォームから新しいタスクを追加してください</p>
          </div>
        )}
      </div>
    </div>
  );
}
