import { Link } from "wouter";
import { ReactNode } from "react";

interface ManagementToolProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
}

const ManagementTool = ({ title, description, icon, href }: ManagementToolProps) => {
  return (
    <Link href={href}>
      <a className="group block rounded-lg p-4 bg-gray-50 hover:bg-primary-50 border border-gray-200 transition">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 h-10 w-10 rounded bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-200">
            {icon}
          </div>
          <h4 className="ml-3 text-base font-medium text-gray-900 group-hover:text-primary-700">{title}</h4>
        </div>
        <p className="text-sm text-gray-500 group-hover:text-primary-600">{description}</p>
      </a>
    </Link>
  );
};

export default ManagementTool;
