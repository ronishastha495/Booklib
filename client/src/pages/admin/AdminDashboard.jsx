import { useState } from 'react';
import { 
  Library, Bell, Search, ChevronDown, Menu, LogOut
} from 'e-react';
import SidebarItem from '../../components/adminsidebar/SidebarItem';
import ADashboard from './ADashbord';
import BookList from './BookList';
import Catalog from './Catalog';
import Inventory from './Inventory';
import Member from './Members';
import Order from './Orders';
import DiscountManagement  from '../../components/admin/DiscountManagement';
import AnnouncementManagement from '../../components/admin/AnnouncementManagement';
import Reports from './Reports';
import Reviews from './Reviews';
import Settings from './Settings';
import { BarChart2, BookOpen, Box, FileText, ShoppingCart, Star, Tag, Users } from 'react-feather';
import { BookProvider } from '../../contexts/BookContext';
import { AnnouncementProvider } from '../../contexts/AnnouncementContext';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-stone-100 font-sans">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-stone-800 text-white transition-all duration-300 ease-in-out flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-stone-700">
          <div className="flex items-center">
            <Library className="h-8 w-8 text-amber-500" />
            {sidebarOpen && <span className="ml-3 text-xl font-semibold text-amber-500">BookHaven</span>}
          </div>
          <button onClick={toggleSidebar} className="text-stone-400 hover:text-white">
            {sidebarOpen ? <ChevronDown className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            <SidebarItem 
              icon={<BarChart2 />} 
              text="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              collapsed={!sidebarOpen} 
            />
            <SidebarItem 
              icon={<BookOpen />} 
              text="Catalog" 
              active={activeTab === 'catalog'} 
              onClick={() => setActiveTab('catalog')} 
              collapsed={!sidebarOpen} 
            />
            <SidebarItem 
              icon={<Box />} 
              text="Inventory" 
              active={activeTab === 'inventory'} 
              onClick={() => setActiveTab('inventory')} 
              collapsed={!sidebarOpen} 
            />
            <SidebarItem 
              icon={<ShoppingCart />} 
              text="Orders" 
              active={activeTab === 'orders'} 
              onClick={() => setActiveTab('orders')} 
              collapsed={!sidebarOpen} 
            />
            <SidebarItem 
              icon={<Users />} 
              text="Members" 
              active={activeTab === 'members'} 
              onClick={() => setActiveTab('members')} 
              collapsed={!sidebarOpen} 
            />
            <SidebarItem 
              icon={<Tag />} 

              text="Discounts" 
              active={activeTab === 'discounts'} 
              onClick={() => setActiveTab('discounts')} 
              collapsed={!sidebarOpen} 
            />
            <SidebarItem 
              icon={<Bell />} 

              text="Announcements" 
              active={activeTab === 'announcements'} 
              onClick={() => setActiveTab('announcements')} 
              collapsed={!sidebarOpen} 
            />
            <SidebarItem 
              icon={<Star />} 
              text="Reviews" 
              active={activeTab === 'reviews'} 
              onClick={() => setActiveTab('reviews')} 
              collapsed={!sidebarOpen} 
            />
            <SidebarItem 
              icon={<FileText />} 

              text="Reports" 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')} 
              collapsed={!sidebarOpen} 
            />
            <SidebarItem 
              icon={<Settings />} 
              text="Settings" 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
              collapsed={!sidebarOpen} 
            />
          </nav>
        </div>
        <div className="p-4 border-t border-stone-700">
          <SidebarItem 
            icon={<LogOut />} 
            text="Log Out" 
            active={false} 
            onClick={() => {}} 
            collapsed={!sidebarOpen} 
          />
        </div>
      </div>

      {/* Main Content */}
      <BookProvider>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm z-10">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <button onClick={toggleSidebar} className="mr-4 md:hidden">
                  <Menu className="h-6 w-6 text-stone-500" />
                </button>
                <h1 className="text-2xl font-semibold text-stone-800">
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'catalog' && 'Book Catalog'}
                  {activeTab === 'inventory' && 'Inventory Management'}
                  {activeTab === 'orders' && 'Orders'}
                  {activeTab === 'members' && 'Members'}
                  {activeTab === 'discounts' && 'Discounts & Promotions'}
                  {activeTab === 'announcements' && 'Announcements'}
                  {activeTab === 'reviews' && 'Book Reviews'}
                  {activeTab === 'reports' && 'Reports'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search..."
                    className="w-64 px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-stone-400" />
                </div>
                <button className="p-2 rounded-full hover:bg-stone-100 relative">
                  <Bell className="h-6 w-6 text-stone-500" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-3 ml-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold">
                    AD
                  </div>
                  <div className="hidden md:block">
                    <p className="font-medium text-stone-800">Admin User</p>
                    <p className="text-sm text-stone-500">Main Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-stone-50 p-6">
            {activeTab === 'dashboard' && <ADashboard />}
            {activeTab === 'catalog' && <Catalog />}
            {activeTab === 'inventory' && <Inventory />}
            {activeTab === 'orders' && <Order />}
            {activeTab === 'members' && <Member />}
            {activeTab === 'discounts' && <DiscountManagement />}
            {activeTab === 'announcements' && <AnnouncementManagement />}
            {activeTab === 'reviews' && <Reviews />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'settings' && <Settings />}
          </main>
        </div>
      </BookProvider>
    </div>
  );
};

export default AdminDashboard;
