import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  linkText: string;
  linkHref: string;
}

const StatCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  linkText,
  linkHref,
}: StatCardProps) => {
  return (
    <div className="dashboard-stat bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <div className={`${iconColor} text-xl`}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:px-6">
        <div className="text-sm">
          <a href={linkHref} className="font-medium text-primary-600 hover:text-primary-500">
            {linkText} <span className="inline align-text-bottom">→</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
