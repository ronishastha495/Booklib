import { BarChart2, Bell, BookOpen, DollarSign, FileText, Package, Plus, ShoppingCart, Tag, UserPlus, Users } from 'lucide-react';
import QuickActionButton from '../../components/adminsidebar/QuickActionButton';


const Dashboard = () => {
  const stats = [
    { title: 'Total Books', value: '2,574', icon: <BookOpen className="h-6 w-6 text-amber-600" />, trend: '+14% from last month', color: 'bg-amber-100' },
    { title: 'Members', value: '1,823', icon: <Users className="h-6 w-6 text-blue-600" />, trend: '+7% from last month', color: 'bg-blue-100' },
    { title: 'Orders', value: '432', icon: <ShoppingCart className="h-6 w-6 text-green-600" />, trend: '+23% from last month', color: 'bg-green-100' },
    { title: 'Revenue', value: '$12,450', icon: <DollarSign className="h-6 w-6 text-purple-600" />, trend: '+18% from last month', color: 'bg-purple-100' },
  ];

  const recentOrders = [
    { id: '#ORD-5132', member: 'Emma Thompson', date: 'May 7, 2025', items: 3, total: '$47.97', status: 'Pending Pickup' },
    { id: '#ORD-5131', member: 'Michael Chen', date: 'May 7, 2025', items: 1, total: '$18.99', status: 'Completed' },
    { id: '#ORD-5130', member: 'Sarah Johnson', date: 'May 6, 2025', items: 2, total: '$32.98', status: 'Pending Pickup' },
    { id: '#ORD-5129', member: 'David Miller', date: 'May 6, 2025', items: 4, total: '$59.96', status: 'Cancelled' },
    { id: '#ORD-5128', member: 'Lisa Rodriguez', date: 'May 5, 2025', items: 2, total: '$29.98', status: 'Completed' },
  ];

  const recentBooks = [
    { id: 1, title: 'The Midnight Library', author: 'Matt Haig', cover: 'https://via.placeholder.com/70x100', stock: 24, price: '$14.99', status: 'In Stock' },
    { id: 2, title: 'Project Hail Mary', author: 'Andy Weir', cover: 'https://via.placeholder.com/70x100', stock: 18, price: '$16.99', status: 'Low Stock' },
    { id: 3, title: 'The Lincoln Highway', author: 'Amor Towles', cover: 'https://via.placeholder.com/70x100', stock: 32, price: '$18.99', status: 'In Stock' },
    { id: 4, title: 'The Four Winds', author: 'Kristin Hannah', cover: 'https://via.placeholder.com/70x100', stock: 0, price: '$15.99', status: 'Out of Stock' },
    { id: 5, title: 'Klara and the Sun', author: 'Kazuo Ishiguro', cover: 'https://via.placeholder.com/70x100', stock: 7, price: '$13.99', status: 'Low Stock' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Section - Horizontal Layout */}
      <div className="flex flex-col sm:flex-row gap-6 overflow-x-auto">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 flex-shrink-0 w-full sm:w-64">
            <div className="flex justify-between">
              <div>
                <p className="text-stone-500 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-stone-800 mt-2">{stat.value}</p>
                <p className="text-sm text-stone-500 mt-2">{stat.trend}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-stone-800">Recent Orders</h3>
          <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Order ID</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Member</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="py-3 px-4 font-medium text-stone-800">{order.id}</td>
                  <td className="py-3 px-4 text-stone-600">{order.member}</td>
                  <td className="py-3 px-4 text-stone-600">{order.total}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'Pending Pickup' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <h3 className="text-lg font-semibold text-stone-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <QuickActionButton icon={<Plus />} text="Add New Book" color="bg-amber-500" />
          <QuickActionButton icon={<UserPlus />} text="Add Member" color="bg-blue-500" />
          <QuickActionButton icon={<Tag />} text="Create Discount" color="bg-purple-500" />
          <QuickActionButton icon={<Package />} text="Update Stock" color="bg-green-500" />
          <QuickActionButton icon={<Bell />} text="New Announcement" color="bg-red-500" />
          <QuickActionButton icon={<FileText />} text="Generate Report" color="bg-indigo-500" />
        </div>
      </div>

      {/* Recent Books */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-stone-800">Recently Added Books</h3>
          <button className="text-amber-600 hover:text-amber-700 text-sm font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Book</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Stock</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Price</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBooks.map((book) => (
                <tr key={book.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img src={book.cover} alt={book.title} className="w-10 h-14 rounded-sm mr-3" />
                      <div>
                        <p className="font-medium text-stone-800">{book.title}</p>
                        <p className="text-sm text-stone-500">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-600">{book.stock}</td>
                  <td className="py-3 px-4 text-stone-600">{book.price}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      book.status === 'In Stock' ? 'bg-green-100 text-green-800' :
                      book.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {book.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-stone-800">Sales Overview</h3>
            <select className="p-2 rounded border border-stone-300 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-stone-50 rounded-lg">
            <BarChart2 className="h-20 w-20 text-stone-300" />
            <p className="ml-4 text-stone-500">Sales chart visualization would appear here</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-stone-800">Popular Categories</h3>
            <select className="p-2 rounded border border-stone-300 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-stone-50 rounded-lg">
            <BarChart2 className="h-20 w-20 text-stone-300" />
            <p className="ml-4 text-stone-500">Category distribution chart would appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;