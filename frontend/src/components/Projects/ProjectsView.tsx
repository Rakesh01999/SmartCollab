'use client';

import { useEffect, useState, FormEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector, useDispatch } from 'react-redux';
import { projectsAPI, teamAPI, tasksAPI } from '../../lib/api';
import { showToast } from '../../store/appSlice';
import {
  FolderPlus,
  Calendar,
  UserPlus,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  Users
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store/store';
import { Project, Task, User } from '../../types';

export default function ProjectsView() {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentProjId, setCurrentProjId] = useState<string | null>(null);

  // Form States
  const [projName, setProjName] = useState<string>('');
  const [projDesc, setProjDesc] = useState<string>('');
  const [projDeadline, setProjDeadline] = useState<string>('');
  const [projStatus, setProjStatus] = useState<string>('Active');
  const [projMembers, setProjMembers] = useState<string[]>([]);

  // Member Assign States
  const [activeAssignProjId, setActiveAssignProjId] = useState<string | null>(null);

  const isAuthorized = currentUser && ['Admin', 'Project Manager'].includes(currentUser.role);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes, teamRes] = await Promise.all([
        projectsAPI.getAll(),
        tasksAPI.getAll({ limit: '100' }),
        teamAPI.getAll()
      ]);
      setProjects(projRes.data.data || []);
      setTasks(taskRes.data.data || []);
      setTeam(teamRes.data.data || []);
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to load projects data', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenCreateModal = () => {
    if (!isAuthorized) return;
    setIsEditMode(false);
    setProjName('');
    setProjDesc('');
    setProjDeadline('');
    setProjStatus('Active');
    setProjMembers([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (proj: Project) => {
    if (!isAuthorized) return;
    setIsEditMode(true);
    setCurrentProjId(proj._id);
    setProjName(proj.name);
    setProjDesc(proj.description || '');
    // format date for input field: YYYY-MM-DD
    const dateFormatted = proj.deadline ? String(proj.deadline).split('T')[0] : '';
    setProjDeadline(dateFormatted);
    setProjStatus(proj.status);
    setProjMembers((proj.members as any[]).map(m => m._id || m));
    setShowModal(true);
  };

  const handleProjectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projName || !projDeadline) {
      dispatch(showToast({ message: 'Name and Deadline are required', type: 'warning' }));
      return;
    }

    try {
      const projectData = {
        name: projName,
        description: projDesc,
        deadline: projDeadline,
        status: projStatus,
        members: projMembers
      };

      if (isEditMode && currentProjId) {
        await projectsAPI.update(currentProjId, projectData);
        dispatch(showToast({ message: 'Project details updated successfully!', type: 'success' }));
      } else {
        await projectsAPI.create(projectData);
        dispatch(showToast({ message: 'New project created successfully!', type: 'success' }));
      }

      setShowModal(false);
      fetchAllData();
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to save project', type: 'error' }));
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!isAuthorized) return;
    if (confirm('Are you absolutely sure you want to delete this project and all its tasks? This action is permanent.')) {
      try {
        await projectsAPI.delete(id);
        dispatch(showToast({ message: 'Project deleted successfully', type: 'success' }));
        fetchAllData();
      } catch (error: any) {
        dispatch(showToast({ message: error.message || 'Failed to delete project', type: 'error' }));
      }
    }
  };

  const handleAddMemberToProject = async (projId: string, memberId: string) => {
    try {
      await projectsAPI.addMember(projId, memberId);
      dispatch(showToast({ message: 'Team member added to project', type: 'success' }));
      setActiveAssignProjId(null);
      fetchAllData();
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to add member', type: 'error' }));
    }
  };

  const handleToggleMemberSelection = (memberId: string) => {
    if (projMembers.includes(memberId)) {
      setProjMembers(projMembers.filter(id => id !== memberId));
    } else {
      setProjMembers([...projMembers, memberId]);
    }
  };

  // Filter projects by search query and status filter
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = proj.name.toLowerCase().includes(search.toLowerCase()) ||
      (proj.description && proj.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || proj.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Title & Operations */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Project Board
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">Manage project scope, assignments, and check timelines.</p>
        </div>

        {isAuthorized && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm md:text-base font-semibold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name/description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm md:text-base text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm md:text-base text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            // Compute project specific tasks and progress
            const projTasks = tasks.filter(t => (t.project as Project)?._id === proj._id || t.project === proj._id);
            const totalProjTasks = projTasks.length;
            const completedProjTasks = projTasks.filter(t => t.status === 'Completed').length;
            const progressRatio = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;

            const daysLeft = Math.ceil((new Date(proj.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            const badgeStyles = {
              Active: 'bg-blue-950 text-blue-400 border-blue-500/20',
              Completed: 'bg-emerald-950 text-emerald-400 border-emerald-500/20',
              'On Hold': 'bg-amber-950 text-amber-400 border-amber-500/20'
            }[proj.status] || 'bg-slate-950 text-slate-400 border-slate-500/20';

            return (
              <div
                key={proj._id}
                className="glass-panel border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between glass-card-hover"
              >
                <div>
                  {/* Status and Action Buttons */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold border ${badgeStyles}`}>
                      {proj.status}
                    </span>

                    {isAuthorized && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(proj)}
                          className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Edit project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj._id)}
                          className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title and description */}
                  <h3 className="font-bold text-base md:text-lg text-slate-200 line-clamp-1">{proj.name}</h3>
                  <p className="text-xs md:text-sm text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                    {proj.description || 'No description provided.'}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-[10px] md:text-xs text-slate-400 font-semibold">
                      <span>Tasks Progress</span>
                      <span>{progressRatio}% ({completedProjTasks}/{totalProjTasks})</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${proj.status === 'On Hold'
                          ? 'bg-amber-500'
                          : progressRatio === 100
                            ? 'bg-emerald-500'
                            : 'bg-indigo-500'
                          }`}
                        style={{ width: `${progressRatio}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-[10px] md:text-xs font-semibold text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      {daysLeft < 0
                        ? `Overdue by ${Math.abs(daysLeft)}d`
                        : `${daysLeft} days remaining`}
                    </span>
                  </div>

                  {/* Members list and Add member button */}
                  <div className="flex items-center gap-1.5 relative">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {(proj.members as any[]).slice(0, 3).map((member: any, i: number) => (
                        <img
                          key={member._id || i}
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-5.5 h-5.5 rounded-full border border-slate-900 bg-slate-800"
                          title={`${member.name} (${member.role})`}
                        />
                      ))}
                      {(proj.members as any[]).length > 3 && (
                        <div className="w-5.5 h-5.5 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] md:text-[10px] font-bold text-slate-400">
                          +{(proj.members as any[]).length - 3}
                        </div>
                      )}
                    </div>

                    {isAuthorized && (
                      <div className="relative">
                        <button
                          onClick={() => setActiveAssignProjId(activeAssignProjId === proj._id ? null : proj._id)}
                          className="w-5.5 h-5.5 rounded-full bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 flex items-center justify-center transition-colors cursor-pointer"
                          title="Assign member to project"
                        >
                          <UserPlus className="w-3 h-3" />
                        </button>

                        {/* Dropdown popup for assigning members */}
                        {activeAssignProjId === proj._id && (
                          <div className="absolute right-0 bottom-7 bg-slate-900 border border-slate-800 rounded-lg p-2 w-48 shadow-xl z-20 max-h-48 overflow-y-auto">
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-500 tracking-wider uppercase block pb-1 border-b border-slate-800 mb-1.5">
                              Add Team Member
                            </span>
                            {team
                              .filter(t => !(proj.members as any[]).some((m: any) => (m._id || m) === t._id))
                              .map(member => (
                                <button
                                  key={member._id}
                                  onClick={() => handleAddMemberToProject(proj._id, member._id as string)}
                                  className="w-full text-left px-2 py-1 text-xs md:text-sm text-slate-300 hover:bg-indigo-950/40 hover:text-indigo-400 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <img src={member.avatarUrl} alt="" className="w-4 h-4 rounded-full bg-slate-800" />
                                  <span className="truncate">{member.name}</span>
                                </button>
                              ))}
                            {team.filter(t => !(proj.members as any[]).some((m: any) => (m._id || m) === t._id)).length === 0 && (
                              <span className="text-[10px] md:text-xs text-slate-500 italic block py-1 text-center">All members assigned.</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && filteredProjects.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 italic bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl">
              No projects found matching the criteria.
            </div>
          )}
        </div>
      )}

      {/* Creation / Editing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-500" />
                {isEditMode ? 'Edit Project Details' : 'Create New Project'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs md:text-sm font-semibold text-slate-400" htmlFor="project-name-input">Project Name *</label>
                <input
                  type="text"
                  id="project-name-input"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm md:text-base text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs md:text-sm font-semibold text-slate-400" htmlFor="project-desc-input">Description</label>
                <textarea
                  id="project-desc-input"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Describe project details, objectives, and deliverables..."
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm md:text-base text-slate-200 focus:outline-none focus:border-indigo-500 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-semibold text-slate-400" htmlFor="project-deadline-input">Deadline Date *</label>
                  <DatePicker
                    id="project-deadline-input"
                    selected={projDeadline ? new Date(projDeadline + 'T00:00:00') : null}
                    onChange={(date: Date | null) => setProjDeadline(date ? date.toISOString().split('T')[0] : '')}
                    minDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select a deadline"
                    required
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm md:text-base text-slate-200 focus:outline-none focus:border-indigo-500"
                    calendarClassName="dark-theme-calendar"
                    popperPlacement="bottom-start"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-semibold text-slate-400" htmlFor="project-status-select">Status</label>
                  <select
                    id="project-status-select"
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm md:text-base text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* Members Selection List */}
              <div className="space-y-1.5">
                <span className="text-xs md:text-sm font-semibold text-slate-400 block">Assign Team Members</span>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-slate-800 p-2.5 rounded-lg bg-slate-950/60">
                  {team.map((member) => {
                    const isSelected = projMembers.includes(member._id as string);
                    return (
                      <button
                        key={member._id}
                        type="button"
                        onClick={() => handleToggleMemberSelection(member._id as string)}
                        className={`flex items-center gap-2 p-1.5 rounded-md text-left text-xs md:text-sm transition-all cursor-pointer ${isSelected
                          ? 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-400'
                          : 'hover:bg-slate-900 border border-transparent text-slate-400'
                          }`}
                      >
                        <img src={member.avatarUrl} alt="" className="w-5 h-5 rounded-full bg-slate-800" />
                        <span className="truncate">{member.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm md:text-base font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm md:text-base font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  {isEditMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
