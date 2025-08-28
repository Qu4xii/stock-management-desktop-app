// Import RepairPriority for the new helper function
import { Repair, RepairStatus, RepairPriority } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const getStatusColor = (status: RepairStatus) => {
  switch (status) {
    case 'Completed': return 'bg-green-500/20 text-green-700 dark:text-green-400';
    case 'In Progress': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
    case 'On Hold': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    case 'Not Started': return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
  }
};

// --- 1. ADD NEW HELPER FUNCTION FOR PRIORITY COLORS ---
const getPriorityColor = (priority: RepairPriority) => {
    switch (priority) {
        case 'Urgent': return 'text-red-600 dark:text-red-400 font-bold';
        case 'High': return 'text-orange-600 dark:text-orange-400 font-semibold';
        case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
        case 'Low': return 'text-gray-600 dark:text-gray-400';
        default: return 'text-gray-600 dark:text-gray-400';
    }
};

interface RepairsTableProps {
  repairs: Repair[];
  onEdit: (repair: Repair) => void;
  onDelete: (repairId: number) => void;
}

function RepairsTable({ repairs, onEdit, onDelete }: RepairsTableProps): JSX.Element {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            {/* --- 2. ADD NEW COLUMN HEADERS --- */}
            <TableHead>Customer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Bill</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repairs.length === 0 ? (
            // --- 3. UPDATE COLSPAN FOR EMPTY MESSAGE ---
            <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No work orders found.</TableCell></TableRow>
          ) : (
            repairs.map((repair) => (
              <TableRow key={repair.id}>
                <TableCell className="font-medium">
                  <div>{repair.clientName || 'N/A'}</div>
                </TableCell>
                <TableCell className="max-w-[250px] truncate">{repair.description}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
                    {repair.status}
                  </span>
                </TableCell>
                
                {/* --- 4. ADD NEW DATA CELLS IN THE SAME ORDER --- */}
                <TableCell>
                  <span className={`${getPriorityColor(repair.priority)}`}>
                    {repair.priority}
                  </span>
                </TableCell>
                <TableCell>{repair.staffName || 'Unassigned'}</TableCell>
                <TableCell>{new Date(repair.requestDate).toLocaleDateString()}</TableCell>
                
                {/* Added checks for potentially null values */}
                <TableCell>{repair.dueDate ? new Date(repair.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{repair.totalPrice != null ? `$${repair.totalPrice.toFixed(2)}` : 'N/A'}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(repair)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete this work order?`)) {
                            onDelete(repair.id);
                          }
                        }}
                        className="text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

export default RepairsTable;