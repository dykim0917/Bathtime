import {
  getContentSnapshotOptionsResponse,
  getContentSnapshotResponse,
} from '@/src/server/contentSnapshotApi';

export function OPTIONS(): Response {
  return getContentSnapshotOptionsResponse();
}

export function GET(): Promise<Response> {
  return getContentSnapshotResponse();
}
