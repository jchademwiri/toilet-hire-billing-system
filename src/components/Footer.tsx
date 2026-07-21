export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-100 border-t border-zinc-800 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg">HS02 Billing System</h3>
            <p className="text-sm text-zinc-400">
              Chemical toilet hire & service billing for City of Tshwane
            </p>
            <p className="text-xs text-zinc-500 mt-2">Contract HS 02-2025/26</p>
          </div>

          {/* Operations */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Operations</h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition">
                  Allocations
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition">
                  Billing Hub
                </a>
              </li>
            </ul>
          </div>

          {/* Management */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Management</h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition">
                  Regions
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition">
                  Coordinators
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition">
                  Reports
                </a>
              </li>
            </ul>
          </div>

          {/* System */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm">System</h4>
            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition">
                  Sage Sync
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition">
                  Invoices
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition">
                  Settings
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-zinc-800 pt-6 flex justify-between items-center text-xs text-zinc-500">
          <p>© 2026 Sithembe Transportation and Projects. All rights reserved.</p>
          <p>
            For internal use only •{" "}
            <a href="#" className="text-zinc-400 hover:text-white transition">
              Audit Trail
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
