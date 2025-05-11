import { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Members = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const { auth } = useAuth();
  const pageSize = 10;

  const fetchUsers = async () => {
  try {
    setLoading(true);
    const response = await fetch(
      `http://localhost:5259/api/Auth/users?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
      {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setUsers(data);
    
    // Get pagination info from headers
    const totalCount = response.headers.get('X-Total-Count');
    const pageCount = response.headers.get('X-Page-Count');
    
    setTotalCount(parseInt(totalCount || '0', 10));
    setTotalPages(parseInt(pageCount || '1', 10));
    
  } catch (err) {
    setError(err.message);
    console.error('Fetch error:', err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (auth?.token) {
      fetchUsers();
    }
  }, [currentPage, searchTerm, sortConfig, auth?.token]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronsUpDown className="h-4 w-4 ml-1 inline-block" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1 inline-block" /> 
      : <ChevronDown className="h-4 w-4 ml-1 inline-block" />;
  };

  if (!auth?.token) return <p className="text-center text-stone-500 mt-10">Please login to view members</p>;
  if (loading) return <p className="text-center text-stone-500 mt-10">Loading users...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-stone-800">Members Management</h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search members..."
            className="w-full pl-4 pr-10 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-stone-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('firstName')}
              >
                Name {getSortIcon('firstName')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('email')}
              >
                Email {getSortIcon('email')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('role')}
              >
                Role {getSortIcon('role')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                Joined {getSortIcon('createdAt')}
              </th>
                
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-semibold">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-stone-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-stone-500">ID: {user.id?.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'Admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-stone-500">
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-stone-500">
          Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
          <span className="font-medium">{totalCount}</span> members
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${currentPage === 1 ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'hover:bg-stone-50'}`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md border ${currentPage === totalPages ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'hover:bg-stone-50'}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Members;