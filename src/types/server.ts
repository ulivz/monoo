/**
 * Module dependencies
 */
import http from 'http';
import { Application, Request, Response, NextFunction } from 'express';

export type TConstructor<T, U extends unknown[] = unknown[]> = new (
  ...args: U
) => T;

export { Application, Request, Response, NextFunction };

export interface IServer {
  app: Application;

  server: http.Server;

  ip: string;

  port: number;

  url: string;

  origin: string;

  protocol: 'http' | 'https';

  bootstrap(): void;

  listen(): Promise<void>;

  destroy(): Promise<void>;
}

export type ISimpleServerConstructor = TConstructor<
  IServer,
  [number /* port */, string /* host */, string /* protocol */]
>;
