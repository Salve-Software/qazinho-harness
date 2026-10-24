/** An issue as its tracker keeps it now, for the agent to read before it adds to it: what it says, whether the team closed it, and what the team said under it. */
export interface ITrackerIssue {
  key: string;
  title: string;
  url: string;
  status: string;
  isClosed: boolean;
  body: string;
  comments: { author: string; at: string; text: string }[];
}
