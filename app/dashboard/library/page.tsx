'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { BookOpen, Plus, Trash2, Edit2, Search, Filter, RefreshCw, CheckCircle2, AlertCircle, FileText, ArrowRightLeft, Calendar, User, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LibraryPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'catalog' | 'issue'>('catalog');
  const [books, setBooks] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals/Forms toggle
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueBook, setShowIssueBook] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);

  // Add Book Form state
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Science',
    quantity: 1,
    rackNo: '',
  });

  // Issue Book Form state
  const [issueForm, setIssueForm] = useState({
    bookId: '',
    borrowerType: 'Student',
    borrowerId: '',
    borrowerName: '',
    dueDate: '',
  });

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const isAdmin = user && ['super_admin', 'admin', 'teacher'].includes(user.role);

  useEffect(() => {
    fetchData();
  }, [token, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'catalog') {
        const response = await fetch('/api/library/books', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setBooks(data.books || []);
        }
      } else {
        const response = await fetch('/api/library/issue', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setIssues(data.issues || []);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author) {
      setError('Title and Author are required');
      return;
    }

    try {
      const url = editingBook ? `/api/library/books/${editingBook._id}` : '/api/library/books';
      const method = editingBook ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookForm),
      });

      if (response.ok) {
        setSuccess(`Book "${bookForm.title}" saved successfully!`);
        setShowAddBook(false);
        setEditingBook(null);
        setBookForm({ title: '', author: '', isbn: '', category: 'Science', quantity: 1, rackNo: '' });
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save book');
      }
    } catch (err) {
      setError('Request failed.');
    }
  };

  const handleEditBookClick = (book: any) => {
    setEditingBook(book);
    setBookForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || 'Science',
      quantity: book.quantity || 1,
      rackNo: book.rackNo || '',
    });
    setShowAddBook(true);
  };

  const handleDeleteBook = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete book "${title}"?`)) return;

    try {
      const response = await fetch(`/api/library/books/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Book deleted successfully');
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete book');
      }
    } catch (err) {
      setError('Connection failed.');
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.bookId || !issueForm.borrowerId || !issueForm.borrowerName || !issueForm.dueDate) {
      setError('Please fill in all issuance details');
      return;
    }

    try {
      const response = await fetch('/api/library/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(issueForm),
      });

      if (response.ok) {
        setSuccess('Book allocated successfully!');
        setShowIssueBook(false);
        setIssueForm({ bookId: '', borrowerType: 'Student', borrowerId: '', borrowerName: '', dueDate: '' });
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message || 'Issuance failed');
      }
    } catch (err) {
      setError('Connection failed.');
    }
  };

  const handleReturnBook = async (id: string) => {
    if (!confirm('Mark this book allocation as returned?')) return;

    try {
      const response = await fetch(`/api/library/issue/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'returned' }),
      });

      if (response.ok) {
        setSuccess('Book returned successfully.');
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to process return');
      }
    } catch (err) {
      setError('Connection failed.');
    }
  };

  const handleDeleteIssueLog = async (id: string) => {
    if (!confirm('Are you sure you want to remove this issuance record from archives?')) return;

    try {
      const response = await fetch(`/api/library/issue/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Issuance log removed.');
        fetchData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete record');
      }
    } catch (err) {
      setError('Connection failed.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Search & Filters matching
  const filteredBooks = books.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (b.isbn && b.isbn.includes(searchQuery));
    const matchesCat = filterCategory === 'all' || b.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const filteredIssues = issues.filter((i) => {
    return i.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (i.bookId && i.bookId.title.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="space-y-6 font-sans print:bg-white print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <BookOpen className="text-indigo-650" size={28} />
            <span>Library Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Organize institutional book catalogs, track borrows, and manage storage racks.</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center space-x-1.5 text-slate-700 bg-white border border-slate-200/60 font-bold text-xs"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </Button>
          {isAdmin && (
            <>
              {activeTab === 'catalog' ? (
                <Button
                  onClick={() => {
                    setEditingBook(null);
                    setBookForm({ title: '', author: '', isbn: '', category: 'Science', quantity: 1, rackNo: '' });
                    setShowAddBook(!showAddBook);
                  }}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 shadow-sm text-xs"
                >
                  <Plus size={16} className="mr-1" />
                  <span>Add Book</span>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    // Pre-fill book select list if catalog is fetched
                    if (books.length === 0) {
                      // Trigger silent load
                      fetch('/api/library/books', { headers: { Authorization: `Bearer ${token}` } })
                        .then(r => r.json())
                        .then(d => setBooks(d.books || []));
                    }
                    setShowIssueBook(!showIssueBook);
                  }}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 shadow-sm text-xs"
                >
                  <ArrowRightLeft size={16} className="mr-1" />
                  <span>New Allocation</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300 print:hidden">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300 print:hidden">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 print:hidden">
        <button
          onClick={() => {
            setActiveTab('catalog');
            setSearchQuery('');
          }}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
            activeTab === 'catalog'
              ? 'text-indigo-650 border-b-2 border-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          Book Catalog
        </button>
        <button
          onClick={() => {
            setActiveTab('issue');
            setSearchQuery('');
          }}
          className={`pb-3 font-bold text-sm transition-all relative cursor-pointer ${
            activeTab === 'issue'
              ? 'text-indigo-650 border-b-2 border-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          Borrow & Return desk
        </button>
      </div>

      {/* Show Add/Edit Book Form */}
      {showAddBook && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 max-w-lg shadow-sm animate-in fade-in slide-in-from-top-4 duration-200 print:hidden">
          <h2 className="text-base font-bold text-slate-850 dark:text-white mb-4">
            {editingBook ? 'Modify Book Information' : 'Register New Book Item'}
          </h2>
          <form onSubmit={handleAddBookSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Book Title</label>
                <input
                  type="text"
                  placeholder="The Catcher in the Rye"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Author Name</label>
                <input
                  type="text"
                  placeholder="J.D. Salinger"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ISBN Number</label>
                <input
                  type="text"
                  placeholder="978-X-XX..."
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={bookForm.category}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                >
                  <option value="Science">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Literature">Literature</option>
                  <option value="History">History</option>
                  <option value="Technology">Technology</option>
                  <option value="General">General Reference</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={bookForm.quantity}
                  onChange={(e) => setBookForm({ ...bookForm, quantity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Storage Rack / Shelf ID</label>
              <input
                type="text"
                placeholder="Rack C, Shelf 4"
                value={bookForm.rackNo}
                onChange={(e) => setBookForm({ ...bookForm, rackNo: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-sm transition-all"
              >
                Save Book
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowAddBook(false);
                  setEditingBook(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 rounded-xl px-5"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Show Issue Book Form */}
      {showIssueBook && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 max-w-lg shadow-sm animate-in fade-in slide-in-from-top-4 duration-200 print:hidden">
          <h2 className="text-base font-bold text-slate-850 dark:text-white mb-4">Allocate Book to Borrower</h2>
          <form onSubmit={handleIssueSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Book</label>
              <select
                value={issueForm.bookId}
                onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                required
              >
                <option value="">Select a book...</option>
                {books.map((b) => (
                  <option key={b._id} value={b._id} disabled={b.available <= 0}>
                    {b.title} (By {b.author}) — Available: {b.available}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Borrower Type</label>
                <select
                  value={issueForm.borrowerType}
                  onChange={(e) => setIssueForm({ ...issueForm, borrowerType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Staff">Office Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Borrower Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={issueForm.borrowerName}
                  onChange={(e) => setIssueForm({ ...issueForm, borrowerName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Borrower MongoDB ID / Roll ID</label>
                <input
                  type="text"
                  placeholder="ID string (12 or 24 hex char)"
                  value={issueForm.borrowerId}
                  // Auto-generate placeholder id to bypass hex constraints if user doesn't know MongoDB ID
                  onChange={(e) => setIssueForm({ ...issueForm, borrowerId: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Return Due Date</label>
                <input
                  type="date"
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-sm transition-all"
              >
                Confirm Allocation
              </Button>
              <Button
                type="button"
                onClick={() => setShowIssueBook(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 rounded-xl px-5"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Main Lists Section */}
      <div className="space-y-4 print:mt-0 print:border-none">
        {/* Search Bar Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={activeTab === 'catalog' ? 'Search books, ISBN, authors...' : 'Search by borrower or book name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold"
            />
          </div>

          {activeTab === 'catalog' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="text-slate-400" size={16} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold w-full sm:w-40"
              >
                <option value="all">All Categories</option>
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Literature">Literature</option>
                <option value="History">History</option>
                <option value="Technology">Technology</option>
                <option value="General">General Reference</option>
              </select>
            </div>
          )}
        </div>

        {/* Directory Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2 print:hidden">
            <RefreshCw className="animate-spin text-indigo-500" size={32} />
            <p className="text-sm font-semibold">Updating library database registers...</p>
          </div>
        ) : activeTab === 'catalog' ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Book Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ISBN</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Available Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Rack</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                      No books registered in the catalog library.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{book.title}</div>
                        <div className="text-xs text-slate-500 font-semibold">{book.author}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500 font-semibold">{book.isbn || '—'}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-550">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{book.quantity} pcs</td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          book.available > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {book.available} Available
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-semibold text-xs">{book.rackNo || '—'}</td>
                      <td className="px-6 py-4 flex space-x-3.5 print:hidden">
                        {isAdmin && (
                          <>
                            <button onClick={() => handleEditBookClick(book)} className="text-amber-605 dark:text-amber-500 hover:text-amber-800">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteBook(book._id, book.title)} className="text-rose-600 dark:text-rose-500 hover:text-rose-800">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Book Allocated</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Borrower Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Due Return Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                      No active book issuances found.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {issue.bookId?.title || 'Unknown Book'}
                        </div>
                        <div className="text-xs text-slate-500 font-semibold">
                          By {issue.bookId?.author || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200 font-bold">{issue.borrowerName}</td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                          {issue.borrowerType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {new Date(issue.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${
                          issue.status === 'issued'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex space-x-3.5 print:hidden">
                        {isAdmin && (
                          <>
                            {issue.status === 'issued' && (
                              <button
                                onClick={() => handleReturnBook(issue._id)}
                                className="text-emerald-600 hover:text-emerald-800 font-bold text-xs"
                                title="Process Return"
                              >
                                Mark Returned
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteIssueLog(issue._id)}
                              className="text-rose-600 dark:text-rose-500 hover:text-rose-800"
                              title="Delete log"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
