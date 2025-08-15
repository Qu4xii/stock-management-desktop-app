// In src/renderer/src/components/ClientList.tsx

import React from 'react';
import { Client } from './types'; // Correct path from within the 'components' folder

/**
 * Defines the props for this component. It expects an array of Client objects.
 */
interface ClientListProps {
  clients: Client[];
}

/**
 * A component to display a list of clients in a structured way.
 * It receives the list of clients as a prop from its parent page.
 */
function ClientList({ clients }: ClientListProps): JSX.Element {
  // If the clients array is empty, we display a helpful message instead of an empty list.
  if (!clients || clients.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md dark:bg-slate-800">
        <p className="text-gray-500 dark:text-slate-400">No clients found. Add a new client using the form above.</p>
      </div>
    );
  }

  // If there are clients, we map over the array to transform each client object into a JSX element.
  return (
    <div className="space-y-4">
      {clients.map((client) => (
        // The 'key' prop is essential for React to efficiently update lists.
        <div key={client.id} className="p-4 bg-white border rounded-lg shadow-sm flex justify-between items-center dark:bg-slate-800 dark:border-slate-700">
          
          {/* Left side: Client Details */}
          <div className="flex items-center">
            {/* Placeholder for a client picture */}
            <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-full mr-4 flex-shrink-0"></div>
            <div>
              <p className="font-semibold text-lg">{client.name}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">ID: {client.idCard}</p>
              <div className="flex space-x-4 mt-2 text-sm text-gray-600 dark:text-slate-300">
                <span>📧 {client.email}</span>
                <span>📞 {client.phone}</span>
              </div>
            </div>
          </div>

          {/* Right side: Action Buttons */}
          <div className="flex space-x-2">
            <button className="text-sm text-blue-500 hover:underline">View Details</button>
            <button className="text-sm text-red-500 hover:underline">Delete</button>
          </div>

        </div>
      ))}
    </div>
  );
}

export default ClientList;