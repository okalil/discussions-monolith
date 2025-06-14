import { NavLink, Outlet } from "react-router";

export const meta = () => [{ title: "Discussions | Profile" }];

export default function Component() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-[256px_1fr] gap-6">
        <div>
          <nav>
            <NavLink
              end
              to="."
              className={(state) =>
                `text-gray-800 rounded-md p-2 flex items-center gap-2 group ${
                  state.isActive ? "bg-gray-100 active" : "hover:bg-gray-100"
                }`
              }
            >
              <span className="text-sm group-[.active]:font-semibold ">
                Profile
              </span>
            </NavLink>
            <NavLink
              to="password"
              className={(state) =>
                `text-gray-800 rounded-md p-2 flex items-center gap-2 group ${
                  state.isActive ? "bg-gray-100 active" : "hover:bg-gray-100"
                }`
              }
            >
              <span className="text-sm group-[.active]:font-semibold ">
                Password
              </span>
            </NavLink>
            <NavLink
              to="accounts"
              className={(state) =>
                `text-gray-800 rounded-md p-2 flex items-center gap-2 group ${
                  state.isActive ? "bg-gray-100 active" : "hover:bg-gray-100"
                }`
              }
            >
              <span className="text-sm group-[.active]:font-semibold ">
                Accounts
              </span>
            </NavLink>
          </nav>
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
