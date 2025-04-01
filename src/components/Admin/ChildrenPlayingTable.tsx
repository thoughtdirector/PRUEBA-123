import {
  ChildrenPlaying,
  ChildrenPlayingList,
} from "../../types/childrenPlaying";

interface Props {
  childrenPlaying: ChildrenPlayingList;
  onStopTime: (child: ChildrenPlaying) => void;
}

const ChildrenPlayingTable = ({ childrenPlaying, onStopTime }: Props) => {
  return (
    <table className="border-collapse border border-gray-400 mt-4">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Child Name</th>
          <th className="border border-gray-300 px-4 py-2">Parent Name</th>
          <th className="border border-gray-300 px-4 py-2">Active Time</th>
          <th className="border border-gray-300 px-4 py-2">Start Time</th>
          <th className="border border-gray-300 px-4 py-2">Stop Time</th>
        </tr>
      </thead>
      <tbody>
        {childrenPlaying.map((child, index) => (
          <tr key={index}>
            <td className="border border-gray-300 px-4 py-2">
              {child.child_name}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {child.parent_name}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {child.active_time}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              {child.start_time}
            </td>
            <td className="border border-gray-300 px-4 py-2">
              <button
                className="px-2 py rounded bg-red-200 text-red-500 font-bold cursor-pointer hover:bg-red-300 hover:shadow-md hover:shadow-red-300 duration-300"
                onClick={() => {
                  onStopTime(child);
                }}
              >
                Stop Time
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ChildrenPlayingTable;
